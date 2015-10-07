'use strict';

(function() {
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  /**
   * @type {Object.<string, string>}
   */
  var amenityClassName = {
    'breakfast': 'hotel-amenity-breakfast',
    'parking': 'hotel-amenity-parking',
    'wifi': 'hotel-amenity-wifi'
  };

  /**
   * @type {Object.<string, string>}
   */
  var starsClassName = {
    '1': 'hotel-stars',
    '2': 'hotel-stars-two',
    '3': 'hotel-stars-three',
    '4': 'hotel-stars-four',
    '5': 'hotel-stars-five'
  };

  /**
   * @type {Object.<string, string>}
   */
  var ratingClassName = {
    '4': 'hotel-rating-four',
    '5': 'hotel-rating-five',
    '6': 'hotel-rating-six',
    '7': 'hotel-rating-seven',
    '8': 'hotel-rating-eight',
    '9': 'hotel-rating-nine'
  };

  /**
   * @type {Element}
   */
  var hotelTemplate = document.getElementById('hotel-template');

  /**
   * Конструктор объектов типа Hotel. Кроме создания объекта, добавляет каждому объекту
   * свойство data_ и фиксирует контекст у обработчика события клика.
   * @constructor
   * @param {Object} data
   */
  var Hotel = function(data) {
    this._data = data;

    // Фиксирование контекста обработчика. При любом вызове this._onClick, объект отеля
    // будет использоваться как контекст (даже при вызове через call и apply).
    this._onClick = this._onClick.bind(this);
  };

  /**
   * Создание DOM-элемента, отрисовка его в переданный контейнер и добавление обработчика события клика.
   * По большей части, не отличается от ранее написанного кода, кроме способа обращения к данным. Теперь
   * они берутся не из аргумента итератора, а хранятся в объекте Hotel в свойстве data_.
   * @param  {Element|DocumentFragment} container
   */
  Hotel.prototype.render = function(container) {
    // Клонирование нового объекта для отеля из шаблона и заполнение его реальными
    // данными, взятыми из свойства data_ созданного конструктором.
    var newHotelElement = hotelTemplate.content.children[0].cloneNode(true);
    var amenitiesContainer = newHotelElement.querySelector('.hotel-amenities');

    newHotelElement.querySelector('.hotel-stars').classList.add(starsClassName[this._data['stars']]);
    newHotelElement.querySelector('.hotel-name').textContent = this._data['name'];
    newHotelElement.querySelector('.hotel-distance-kilometers').textContent = [this._data['distance'], 'км'].join(' ');
    newHotelElement.querySelector('.hotel-price-value').textContent = this._data['price'];
    newHotelElement.querySelector('.hotel-rating').textContent = this._data['rating'];
    newHotelElement.querySelector('.hotel-rating').classList.add(ratingClassName[Math.floor(this._data['rating'])]);

    this._data['amenities'].forEach(function(amenity) {
      var amenityElement = document.createElement('li');
      amenityElement.classList.add('hotel-amenity');
      amenityElement.classList.add(amenityClassName[amenity]);
      amenitiesContainer.appendChild(amenityElement);
    });

    // Добавление в контейнер.
    container.appendChild(newHotelElement);

    // Добавление фонового изображения.
    if (this._data['preview']) {
      var hotelBackground = new Image();
      hotelBackground.src = this._data['preview'];

      var imageLoadTimeout = setTimeout(function() {
        newHotelElement.classList.add('hotel-nophoto');
      }, REQUEST_FAILURE_TIMEOUT);

      hotelBackground.onload = function() {
        newHotelElement.style.backgroundImage = 'url(\'' + hotelBackground.src + '\')';
        newHotelElement.style.backgroundSize = '100% auto';
        clearTimeout(imageLoadTimeout);
      };

      hotelBackground.onerror = function() {
        newHotelElement.classList.add('hotel-nophoto');
      };
    }

    this._element = newHotelElement;
    // Обработчик клика по отелю.
    this._element.addEventListener('click', this._onClick);
  };

  /**
   * Удаление DOM-элемента отеля и удаление обработчика события клика.
   */
  Hotel.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  /**
   * Обработчик события клика по элементу отеля. Проверяет, отсутствует ли у элемента класс hotel-nophoto
   * и если да, то создает кастомное событие showgallery с добавочными данными в свойстве detail, которые
   * указывают на текущий объект отеля. Это используется для передачи фотографий отеля в фотогалерею.
   * @private
   */
  Hotel.prototype._onClick = function() {
    if (!this._element.classList.contains('hotel-nophoto')) {
      var galleryEvent = new CustomEvent('showgallery', { detail: { hotelElement: this }});
      window.dispatchEvent(galleryEvent);
    }
  };

  /**
   * Возвращает список фотографий текущего отеля, получив его из объекта data_.
   * @return {Array.<string>}
   */
  Hotel.prototype.getPhotos = function() {
    return this._data.pictures;
  };

  // Экспорт конструктора объекта Hotel в глобальную область видимости.
  window.Hotel = Hotel;
})();
