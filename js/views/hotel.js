'use strict';

define(function() {
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
   * @constructor
   * @extends {Backbone.View}
   */
  var HotelView = Backbone.View.extend({
    /**
     * @override
     */
    initialize: function() {
      this._onImageLoad = this._onImageLoad.bind(this);
      this._onImageFail = this._onImageFail.bind(this);
      this._onModelLike = this._onModelLike.bind(this);
      this._onClick = this._onClick.bind(this);

      this.model.on('change:liked', this._onModelLike);
    },

    /**
     * Маппинг событий происходящих на элементе на названия методов обработчиков
     * событий.
     * @type {Object.<string, string>}
     */
    events: {
      'click': '_onClick'
    },

    /**
     * Тег, использующийся для элемента представления.
     * @type {string}
     * @override
     */
    tagName: 'article',

    /**
     * Класс элемента.
     * @type {string}
     * @override
     */
    className: 'hotel',

    /**
     * Отрисовка карточки отеля
     * @override
     */
    render: function() {
      // Клонирование нового объекта для отеля из шаблона и заполнение его реальными
      // данными, взятыми из свойства data_ созданного конструктором.
      this.el.appendChild(hotelTemplate.content.children[0].cloneNode(true));
      var amenitiesContainer = this.el.querySelector('.hotel-amenities');

      this.el.querySelector('.hotel-stars').classList.add(starsClassName[this.model.get('stars')]);
      this.el.querySelector('.hotel-name').textContent = this.model.get('name');
      this.el.querySelector('.hotel-distance-kilometers').textContent = [this.model.get('distance'), 'км'].join(' ');
      this.el.querySelector('.hotel-price-value').textContent = this.model.get('price');
      this.el.querySelector('.hotel-rating').textContent = this.model.get('rating');
      this.el.querySelector('.hotel-rating').classList.add(ratingClassName[Math.floor(this.model.get('rating'))]);

      this.model.get('amenities').forEach(function(amenity) {
        var amenityElement = document.createElement('li');
        amenityElement.classList.add('hotel-amenity');
        amenityElement.classList.add(amenityClassName[amenity]);
        amenitiesContainer.appendChild(amenityElement);
      });

      // Добавление фонового изображения.
      if (this.model.get('preview')) {
        var hotelBackground = new Image();
        hotelBackground.src = this.model.get('preview');

        this._imageLoadTimeout = setTimeout(function() {
          this.el.classList.add('hotel-nophoto');
        }.bind(this), REQUEST_FAILURE_TIMEOUT);

        hotelBackground.addEventListener('load', this._onImageLoad);
        hotelBackground.addEventListener('error', this._onImageFail);
        hotelBackground.addEventListener('abort', this._onImageFail);
      }

      this._updateLike();
    },

    /**
     * Обработчик кликов по элементу.
     * @param {MouseEvent} evt
     * @private
     */
    _onClick: function(evt) {
      var clickedElement = evt.target;

      // Клик по фоновому элементу вызывает событие галереи, которая показывается
      // если у отеля есть фотографии.
      if (clickedElement.classList.contains('hotel') &&
          !clickedElement.classList.contains('hotel-nophoto')) {
        this.trigger('galleryclick');
      }

      // Клик по иконке сердца, добавляет отель в избранное или удаляет его
      // из избранного.
      if (evt.target.classList.contains('hotel-favourite')) {
        if (this.model.get('liked')) {
          this.model.dislike();
        } else {
          this.model.like();
        }
      }
    },

    /**
     * @param {Event} evt
     * @private
     */
    _onImageLoad: function(evt) {
      clearTimeout(this._imageLoadTimeout);

      var loadedImage = evt.path[0];
      this._cleanupImageListeners(loadedImage);

      this.el.style.backgroundImage = 'url(\'' + loadedImage.src + '\')';
      this.el.style.backgroundSize = '100% auto';
    },

    /**
     * @param {Event} evt
     * @private
     */
    _onImageFail: function(evt) {
      var failedImage = evt.path[0];
      this._cleanupImageListeners(failedImage);

      failedImage.src = 'failed.jpg';
      this.el.classList.add('hotel-nophoto');
    },

    /**
     * @private
     */
    _onModelLike: function() {
      this._updateLike();
    },

    /**
     * @private
     */
    _updateLike: function() {
      var likeButton = this.el.querySelector('.hotel-favourite');

      if (likeButton) {
        likeButton.classList.toggle('hotel-favourite-liked', this.model.get('liked'));
      }
    },

    /**
     * Удаление обработчиков событий на элементе.
     * @param {Image} image
     * @private
     */
    _cleanupImageListeners: function(image) {
      image.removeEventListener('load', this._onImageLoad);
      image.removeEventListener('error', this._onImageError);
      image.removeEventListener('abort', this._onImageError);
    }
  });

  return HotelView;
});
