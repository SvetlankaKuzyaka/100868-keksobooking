/*
  global
    Gallery: true
    google: true
    HotelsCollection: true
    HotelView: true
    MapView: true
    __mapsRegisteredCallbacks: true
*/

'use strict';

/**
 * @type {Array.<function>}
 */
var __mapsRegisteredCallbacks = [];

/**
 * JSONP коллбэк, который вызывается после загрузки API карт. Разница в том,
 * что по JSONP передаются не данные, а код, т.е. библиотека google.
 * initMap представляет собой просто абстрактный обработчик очереди. Существует
 * массив __mapsRegisteredCallbacks, который представляет собой очередь
 * функций, которые надо выполнить после загрузки карт. В нашем случае первая
 * функция — это инициализация класса MapView.
 * @param {function} callback
 */
/* eslint-disable */
/*
 Отключение проверки на неиспользуемые переменные, поскольку
 заведомо единственное использование этого метода — скриптом API карт Google
 после их загрузки.
 */
function onMapLoad(callback) {
/* eslint-enable */
  var callbacksToExec = __mapsRegisteredCallbacks.slice(0);
  while ((callback = callbacksToExec.shift())) {
    callback();
  }
}

(function() {
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  /**
   * @const
   * @type {number}
   */
  var PAGE_SIZE = 9;

  /**
   * @type {number}
   */
  var currentPage = 0;

  /**
   * Контейнер списка отелей.
   * @type {Element}
   */
  var hotelsContainer = document.querySelector('.hotels-list');

  /**
   * Объект типа фотогалерея.
   * @type {Gallery}
   */
  var gallery = new Gallery();

  /**
   * @type {HotelsCollection}
   */
  var hotelsCollection = new HotelsCollection();

  /**
   * @type {Array.<Object>}
   */
  var initiallyLoaded = [];

  /**
   * @type {Array.<HotelView>}
   */
  var renderedViews = [];

  /**
   * Выводит на страницу список отелей постранично.
   * @param {number} pageNumber
   * @param {boolean=} replace
   */
  function renderHotels(pageNumber, replace) {
    var fragment = document.createDocumentFragment();
    var hotelsFrom = pageNumber * PAGE_SIZE;
    var hotelsTo = hotelsFrom + PAGE_SIZE;

    if (replace) {
      while (renderedViews.length) {
        var viewToRemove = renderedViews.shift();
        // Важная особенность представлений бэкбона: remove занимается только удалением
        // обработчиков событий, по факту это метод, который нужен для того, чтобы
        // подчистить память после удаления элемента из дома. Добавление/удаление
        // элемента в DOM должно производиться вручную.
        hotelsContainer.removeChild(viewToRemove.el);
        viewToRemove.off('galleryclick');
        viewToRemove.remove();
      }
    }

    hotelsCollection.slice(hotelsFrom, hotelsTo).forEach(function(model) {
      var view = new HotelView({ model: model });
      // render только создает элемент в памяти, после этого его нужно
      // добавить в документ вручную.
      view.render();
      fragment.appendChild(view.el);
      renderedViews.push(view);

      // В этом случае можно использовать анонимный обработчик событий,
      // потому что Backbone умеет удалять все подписки на событие
      // определенного типа, поэтому ссылку на обработчик хранить необязательно.
      view.on('galleryclick', function() {
        gallery.setPhotos(view.model.get('pictures'));
        gallery.setCurrentPhoto(0);
        gallery.show();
      });
    });

    hotelsContainer.appendChild(fragment);
  }

  /**
   * Добавляет класс ошибки контейнеру с отелями. Используется в случае
   * если произошла ошибка загрузки отелей или загрузка прервалась
   * по таймауту.
   */
  function showLoadFailure() {
    hotelsContainer.classList.add('hotels-list-failure');
  }

  /**
   * Фильтрация списка отелей. Принимает на вход список отелей
   * и ID фильтра. В зависимости от переданного ID применяет
   * разные алгоритмы фильтрации. Возвращает отфильтрованный
   * список и записывает примененный фильтр в localStorage.
   * Не изменяет исходный массив.
   * @param {string} filterID
   * @return {Array.<Object>}
   */
  function filterHotels(filterID) {
    var list = initiallyLoaded.slice(0);

    switch (filterID) {
      // При сортировке по возрастанию цены используется необычный алгоритм.
      // Он отправляет все отели, у которых цена равна нулю в конец списка,
      // оставляя при этом остальной список отсортированным от меньшей цены
      // к большей.
      case 'sort-by-price-asc':
        list.sort(function(a, b) {
          if (a.price > b.price || (b.price && a.price === 0)) {
            return 1;
          }

          if (a.price < b.price || (a.price && b.price === 0)) {
            return -1;
          }

          if (a.price === b.price) {
            return 0;
          }
        });
        break;

      case 'sort-by-price-desc':
        list.sort(function(a, b) {
          return b.price - a.price;
        });
        break;
    }

    hotelsCollection.reset(list);
    localStorage.setItem('filterID', filterID);
  }

  /**
   * Проверяет есть ли у переданного элемента или одного из его родителей
   * переданный CSS-класс.
   * @param {Element} element
   * @param {string} className
   * @return {boolean}
   */
  function doesHaveParent(element, className) {
    do {
      if (element.classList.contains(className)) {
        return true;
      }

      element = element.parentElement;
    } while (element);

    return false;
  }

  /**
   * Инициализация подписки на клики по кнопкам фильтра.
   * Используется делегирование событий: события обрабатываются на объекте,
   * содержащем все фильтры, и в момент наступления события, проверяется,
   * произошел ли клик по фильтру или нет и если да, то вызывается функция
   * установки фильтра.
   */
  function initFilters() {
    var filtersContainer = document.querySelector('.hotels-filters');

    filtersContainer.addEventListener('click', function(evt) {
      evt.preventDefault();
      var clickedFilter = evt.target;

      if (doesHaveParent(clickedFilter, 'hotel-filter')) {
        setActiveFilter(clickedFilter.id);
      }
    });
  }

  /**
   * Вызывает функцию фильтрации на списке отелей с переданным fitlerID
   * и подсвечивает кнопку активного фильтра.
   * @param {string} filterID
   */
  function setActiveFilter(filterID) {
    filterHotels(filterID);
    currentPage = 0;
    renderHotels(currentPage, true);

    document.querySelector('.hotel-filter-selected').classList.remove('hotel-filter-selected');
    document.querySelector('#' + filterID).classList.add('hotel-filter-selected');
  }

  /**
   * Проверяет можно ли отрисовать следующую страницу списка отелей.
   * @return {boolean}
   */
  function isNextPageAvailable() {
    return currentPage < Math.ceil(hotelsCollection.length / PAGE_SIZE);
  }

  /**
   * Проверяет, находится ли скролл внизу страницы.
   * @return {boolean}
   */
  function isAtTheBottom() {
    var GAP = 100;
    return hotelsContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  /**
   * Испускает на объекте window событие loadneeded если скролл находится внизу
   * страницы и существует возможность показать еще одну страницу.
   */
  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('hitthebottom'));
    }
  }

  /**
   * Создает два обработчика событий: на прокручивание окна, который в оптимизированном
   * режиме (раз в 100 миллисекунд скролла) проверяет можно ли отрисовать следующую страницу;
   * и обработчик события loadneeded, который вызывает функцию отрисовки следующей страницы.
   */
  function initScroll() {
    var scrollTimeout;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('hitthebottom', function() {
      renderHotels(++currentPage, false);
    });
  }

  /**
   * Инициализация Google карты. Проверяет, подключилось ли API карт, если да,
   * то создает представление карты, в противном случае ставит инициализацию
   * в очередь обработки.
   */
  function initMap() {
    /**
     * Основная логика находится в этой функции. Функция нужна потому, что
     * на момент выполнения initMap неясно — загрузилось ли API карт Google.
     * Если да, то функция вызывается сразу и отрисовывает карту, в противном
     * случае ставит эту функцию в очередь на исполнение после загрузки API.
     * @return
     */
    function createAndRenderMap() {
      var myMap = new MapView({ collection: hotelsCollection });
      myMap.setElement(document.querySelector('.map'));
      myMap.render();
    }

    // NB! Сложная проверка нужна потому что даже когда загрузка не закончена
    // в объекте google может создаться неймспейс maps, в котором, однако,
    // не будет нужных конструкторов. Поэтому существуют три ступени проверки:
    // загружен ли скрипт google, успел ли он создать модуль maps и успел
    // ли загрузить в него API карт.
    if (typeof window['google'] !== 'undefined' && google.maps && google.maps.Map) {
      createAndRenderMap();
    } else {
      __mapsRegisteredCallbacks.push(createAndRenderMap);
    }
  }

  hotelsCollection.fetch({ timeout: REQUEST_FAILURE_TIMEOUT }).success(function(loaded, state, jqXHR) {
    initiallyLoaded = jqXHR.responseJSON;
    initFilters();
    initScroll();
    initMap();

    setActiveFilter(localStorage.getItem('filterID') || 'sort-by-default');
  }).fail(function() {
    showLoadFailure();
  });
})();
