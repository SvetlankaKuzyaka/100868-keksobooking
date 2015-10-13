/* global Gallery: true HotelsCollection: true HotelView: true */

'use strict';

(function() {
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
        viewToRemove.remove();
      }
    }

    hotelsCollection.slice(hotelsFrom, hotelsTo).forEach(function(model) {
      var view = new HotelView({ model: model });
      view.render();
      fragment.appendChild(view.el);
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
    switch (filterID) {
      // При сортировке по возрастанию цены используется необычный алгоритм.
      // Он отправляет все отели, у которых цена равна нулю в конец списка,
      // оставляя при этом остальной список отсортированным от меньшей цены
      // к большей.
      case 'sort-by-price-asc':
        hotelsCollection.sortBy('price');
        break;
      case 'sort-by-price-desc':
        hotelsCollection.sortBy('price');
        break;
      default: break;
    }

    localStorage.setItem('filterID', filterID);
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
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('hitthebottom', function() {
      renderHotels(++currentPage, false);
    });
  }

  /**
   * Добавляет обработчик события showgallery, которое испускается объектом window
   * в объекте типа Hotel, если произошел клик по фотографии отеля. При наступлении
   * этого события, показывает фотогалерею и загружает в нее фотографии отеля,
   * полученные через метод getPhotos() у отеля, переданного через объект
   * CustomEvent.prototype.detail.
   */
  function initGallery() {
    window.addEventListener('showgallery', function(evt) {
      gallery.setPhotos(evt.detail.hotelElement.getPhotos());
      gallery.show();
    });
  }

  hotelsCollection.fetch({ timeout: REQUEST_FAILURE_TIMEOUT }).success(function(/*loaded, state, jqXHR*/) {
    initFilters();
    initScroll();
    initGallery();

    setActiveFilter(localStorage.getItem('filterID') || 'sort-hotels-default');
  }).fail(function(/*jqXHR, state, message*/) {
    showLoadFailure();
  });
})();
