'use strict';

(function() {
  /**
   * Список констант кодов нажатых клавиш для обработки
   * клавиатурных событий.
   * @enum {number}
   */
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };

  /**
   * Функция, "зажимающая" переданное значение value между значениями
   * min и max. Возвращает value которое будет не меньше min
   * и не больше max.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Конструктор объекта фотогалереи. Создает свойства, хранящие ссылки на элементы
   * галереи, служебные данные (номер показанной фотографии и список фотографий)
   * и фиксирует контекст у обработчиков событий.
   * @constructor
   */
  var Gallery = function() {
    this._element = document.body.querySelector('.gallery-overlay');
    this._closeButton = this._element.querySelector('.gallery-overlay-close');
    this._leftButton = this._element.querySelector('.gallery-overlay-control-left');
    this._rightButton = this._element.querySelector('.gallery-overlay-control-right');
    this._pictureElement = this._element.querySelector('.gallery-overlay-preview');

    this._currentPhoto = 0;
    this._photos = [];

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onLeftButtonClick = this._onLeftButtonClick.bind(this);
    this._onRightButtonClick = this._onRightButtonClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  };

  /**
   * Показывает фотогалерею, убирая у контейнера класс hidden. Затем добавляет
   * обработчики событий и показывает текущую фотографию.
   */
  Gallery.prototype.show = function() {
    this._element.classList.remove('hidden');

    this._closeButton.addEventListener('click', this._onCloseClick);
    this._leftButton.addEventListener('click', this._onLeftButtonClick);
    this._rightButton.addEventListener('click', this._onRightButtonClick);
    document.body.addEventListener('keydown', this._onKeyDown);

    this._showCurrentPhoto();
  };

  /**
   * Убирает фотогалерею и обработчики событий. Очищает служебные свойства.
   */
  Gallery.prototype.hide = function() {
    this._element.classList.add('hidden');

    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._leftButton.removeEventListener('click', this._onLeftButtonClick);
    this._rightButton.removeEventListener('click', this._onRightButtonClick);
    document.body.removeEventListener('keydown', this._onKeyDown);

    this._photos = [];
    this._currentPhoto = 0;
  };

  /**
   * Приватный метод, показывающий текущую фотографию. Убирает предыдущюю
   * отрисованную фотографию, создает объект Image с src указанным
   * в массиве photos_ под индексом currentPhoto_ и после загрузки показывает
   * его на странице.
   * @private
   */
  Gallery.prototype._showCurrentPhoto = function() {
    this._pictureElement.innerHTML = '';

    var imageElement = new Image();
    imageElement.src = this._photos[this._currentPhoto];
    imageElement.onload = function() {
      this._pictureElement.appendChild(imageElement);
    }.bind(this);
  };

  /**
   * Обработчик события клика по крестику закрытия. Вызывает метод hide.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onCloseClick = function(evt) {
    evt.preventDefault();
    this.hide();
  };

  /**
   * Обработчик события клика по стрелке влево.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onLeftButtonClick = function(evt) {
    evt.preventDefault();
    this.setCurrentPhoto(this._currentPhoto - 1);
  };

  /**
   * Обработчик события клика по стрелке вправо.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onRightButtonClick = function(evt) {
    evt.preventDefault();
    this.setCurrentPhoto(this._currentPhoto + 1);
  };

  /**
   * Обработчик клавиатурных событий. Прячет галерею при нажатии Esc
   * и переключает фотографии при нажатии на стрелки.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onKeyDown = function(evt) {
    switch (evt.keyCode) {
      case Key.ESC:
        this.hide();
        break;

      case Key.LEFT:
        this.setCurrentPhoto(this._currentPhoto - 1);
        break;

      case Key.RIGHT:
        this.setCurrentPhoto(this._currentPhoto + 1);
        break;
    }
  };

  /**
   * Записывает список фотографий.
   * @param {Array.<string>} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
  };

  /**
   * Устанавливает номер фотографии, которую нужно показать, предварительно
   * "зажав" его между 0 и количеством фотографий в галерее минус 1 (чтобы нельзя
   * было показать фотографию номер -1 или номер 100 в массиве из четырех
   * фотографий), и показывает ее на странице.
   * @param {number} index
   */
  Gallery.prototype.setCurrentPhoto = function(index) {
    index = clamp(index, 0, this._photos.length - 1);

    if (this._currentPhoto === index) {
      return;
    }

    this._currentPhoto = index;
    this._showCurrentPhoto();
  };

  // Экспорт конструктора Gallery в глобальную область видимости.
  window.Gallery = Gallery;
})();
