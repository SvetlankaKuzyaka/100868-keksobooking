/* global Hotel: true Gallery: true */

'use strict';

(function() {
  /**
   * Константы, описывающие состояние ReadyState.
   * @enum {number}
   */
  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };

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
   * Исходный список загруженных с сервера данных для отелей.
   * @type {Array.<Object>}
   */
  var hotels;

  /**
   * Текущий отрисованный на странице список отелей. Отличается
   * от hotels тем, что может быть в данный момент отфильтрован.
   * @type {Array.<Object>}
   */
  var currentHotels;

  /**
   * Номер текущей страницы.
   * @type {number}
   */
  var currentPage = 0;

  /**
   * Список отрисованных отелей. Используется для обращения к каждому
   * из отелей для удаления его со страницы.
   * @type {Array.<Hotel>}
   */
  var renderedHotels = [];

  /**
   * Выводит на страницу список отелей постранично.
   * @param {Array.<Object>} hotelsToRender
   * @param {number} pageNumber
   * @param {boolean=} replace
   */
  function renderHotels(hotelsToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    // Удаление списка отелей. Пока в массиве renderedHotels есть объекты
    // Hotel, вызывается функция Array.prototype.shift(), которая удаляет
    // первый элемент из массива и возвращает его, и у этого отеля вызывается
    // метод Hotel.prototype.unrender.
    if (replace) {
      var el;
      while ((el = renderedHotels.shift())) {
        el.unrender();
      }

      hotelsContainer.classList.remove('hotels-list-failure');
    }

    var hotelsFragment = document.createDocumentFragment();

    var hotelsFrom = pageNumber * PAGE_SIZE;
    var hotelsTo = hotelsFrom + PAGE_SIZE;
    hotelsToRender = hotelsToRender.slice(hotelsFrom, hotelsTo);

    // Отрисовка списка отелей. На каждой итерации цикла создается объект
    // типа Hotel с уникальными данными, отрисовывается в предназначенный
    // для него контейнер (hotelsFragment) и добавляется в массив renderedHotels.
    hotelsToRender.forEach(function(hotelData) {
      var newHotelElement = new Hotel(hotelData);
      newHotelElement.render(hotelsFragment);
      renderedHotels.push(newHotelElement);
    });

    hotelsContainer.appendChild(hotelsFragment);
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
   * Загрузка списка отелей. После успешной загрузки вызывается функция
   * callback, которая передается в качестве аргумента.
   * @param {function} callback
   */
  function loadHotels(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/hotels-xhr.json');
    xhr.send();

    xhr.onreadystatechange = function(evt) {
      var loadedXhr = evt.target;

      switch (loadedXhr.readyState) {
        case ReadyState.OPENED:
        case ReadyState.HEADERS_RECEIVED:
        case ReadyState.LOADING:
          hotelsContainer.classList.add('hotels-list-loading');
          break;

        case ReadyState.DONE:
        default:
          if (xhr.status === 200) {
            var data = loadedXhr.response;
            hotelsContainer.classList.remove('hotels-list-loading');
            callback(JSON.parse(data));
          }

          if (xhr.status > 400) {
            showLoadFailure();
          }
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };
  }

  /**
   * Фильтрация списка отелей. Принимает на вход список отелей
   * и ID фильтра. В зависимости от переданного ID применяет
   * разные алгоритмы фильтрации. Возвращает отфильтрованный
   * список и записывает примененный фильтр в localStorage.
   * Не изменяет исходный массив.
   * @param {Array.<Object>} hotelsToFilter
   * @param {string} filterID
   * @return {Array.<Object>}
   */
  function filterHotels(hotelsToFilter, filterID) {
    var filteredHotels = hotelsToFilter.slice(0);
    switch (filterID) {
      // При сортировке по возрастанию цены используется необычный алгоритм.
      // Он отправляет все отели, у которых цена равна нулю в конец списка,
      // оставляя при этом остальной список отсортированным от меньшей цены
      // к большей.
      case 'sort-by-price-asc':
        filteredHotels = filteredHotels.sort(function(a, b) {
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
        filteredHotels = filteredHotels.sort(function(a, b) {
          if (a.price > b.price) {
            return -1;
          }

          if (a.price < b.price) {
            return 1;
          }

          if (a.price === b.price) {
            return 0;
          }
        });
        break;
    }

    localStorage.setItem('filterID', filterID);
    return filteredHotels;
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

      if (clickedFilter.classList.contains('filter-element')) {
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
    currentHotels = filterHotels(hotels, filterID);
    currentPage = 0;
    renderHotels(currentHotels, currentPage, true);

    document.querySelector('.hotel-filter-selected').classList.remove('hotel-filter-selected');
    document.querySelector('#' + filterID).classList.add('hotel-filter-selected');
  }

  /**
   * Проверяет можно ли отрисовать следующую страницу списка отелей.
   * @return {boolean}
   */
  function isNextPageAvailable() {
    return currentPage < Math.ceil(hotels.length / PAGE_SIZE);
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
      window.dispatchEvent(new CustomEvent('loadneeded'));
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

    window.addEventListener('loadneeded', function() {
      renderHotels(currentHotels, currentPage++, false);
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

  initFilters();
  initScroll();
  initGallery();

  // Загружает список отелей из файла data/hotels.json и отрисовывает его
  // на странице после вызова фильтрации с ID сохраненным в localStorage.
  // Если в localStorage не сохранен ID фильтра, используется значение
  // по умолчанию.
  loadHotels(function(loadedHotels) {
    hotels = loadedHotels;
    setActiveFilter(localStorage.getItem('filterID') || 'sort-hotels-default');
  });
})();
