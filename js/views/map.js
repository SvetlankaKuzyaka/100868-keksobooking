/* global google: true  */

'use strict';

define([
  'views/map-marker',
  'views/poi-marker',
  'models/poi'
], function(HotelMarkerView, POIMarkerView, POICollection) {
  /**
   * Центр Токио для инициализации карты с правильными координатами.
   * @const
   * @type {{ lat: number, lng: number }}
   */
  var TOKIO_CENTER = {
    lat: 35.6833,
    lng: 139.6833
  };

  /**
   * Время анимации разворачивания карты с небольшим запасом. Используется
   * для того, чтобы отправить карте событие перерисовки после того, как она
   * развернется на полный экран. В противном случае, вьюпорт карты останется
   * прежних размеров.
   * @const
   * @type {number}
   */
  var ANIMATION_DURATION = 210;

  /**
   * Представление карты. В отличие от других представлений, не создает
   * свою разметку самостоятельно, а использует заранее подготовленную.
   * Поэтому работа с такой картой ведется несколько иначе. В этом представлении
   * не нужно задавать таких параметров как название тега или класса, но после
   * его создания, нужно вызвать метод setElement и передать ему тот элемент
   * с правильной разметкой, который послужит контейнером для этого
   * представления.
   * @constructor
   * @extends {Backbone.View}
   */
  var MapView = Backbone.View.extend({
    /** @override */
    initialize: function() {
      this._markers = [];
      this._collapsed = true;
      this._onClick = this._onClick.bind(this);
      this._onHashChange = this._onHashChange.bind(this);

      // Загрузка списка достопримечательностей в модель POICollection. После
      // загрузки всех достопримечательностей, они добавляются в общий список
      // маркеров, так как благодаря полиморфизму с ними можно производить
      // те же действия, что и с маркерами отелей на карте. После добавления
      // их в список маркеров выполняется проверка, не успел ли пользователь
      // открыть карту. Если успел, маркеры добавляются на карту.
      this._poiCollection = new POICollection();
      this._poiCollection.fetch().then(function() {
        this._poiCollection.forEach(function(attraction) {
          this._markers.push(new POIMarkerView({ model: attraction }));
        }, this);

        if (!this._collapsed) {
          this.drawMarkers();
        }
      }.bind(this));

      window.addEventListener('hashchange', this._onHashChange);
    },

    /** @override */
    events: {
      'click': '_onClick'
    },

    /**
     * В отличие от стандартного метода Backbone.View.prototype.render,
     * для отрисовки карты используются не операции с DOM-деревом, а манипуляции
     * с Google Maps API. После задания компоненте карты элемента с необходимой
     * разметкой, вызывается метод render, который через Google Maps API
     * отрисовывает карту в нужный блок и создает все необходимые маркеры.
     * @override
     */
    render: function() {
      this._mapContainer = this.el.querySelector('.map-container');

      if (!this._mapContainer) {
        throw new Error('There is no container for Google Map. ' +
            'Probably setElement hasn\'t been called on this MapView ' +
            'before render.');
      }

      this.map = new google.maps.Map(this._mapContainer, {
        center: new google.maps.LatLng(TOKIO_CENTER.lat, TOKIO_CENTER.lng),
        scrollwheel: false,
        zoom: 12
      });

      this.collection.forEach(function(item) {
        this._markers.push(new HotelMarkerView({ model: item }));
      }, this);

      this.syncWithURL();
    },

    /**
     * Вызывает схлопывание или развертывание карты, в зависимости от того,
     * что записано в адресной строке.
     */
    syncWithURL: function() {
      this.setCollapsed(!/^#map$/.test(location.hash));
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onClick: function(evt) {
      if (evt.target.classList.contains('map-switch')) {
        if (!this._collapsed) {
          location.hash = '';
        } else {
          location.hash = 'map';
        }
      }
    },

    /**
     * Обработчик события изменения адресной строки.
     * @private
     */
    _onHashChange: function() {
      this.syncWithURL();
    },

    /**
     * Метод, который переключает состояние карты между свернутым и развернутым.
     * В развернутом состоянии карта занимает почти весь экран и на ней показаны
     * маркеры отелей и достопримечательностей. Соответственно, маркеры
     * отрисовываются на карте только после ее разворачивания, а при
     * сворачивании убираются.
     * @param {boolean} collapsed
     * @param {=boolean} force
     */
    setCollapsed: function(collapsed, force) {
      if (this._collapsed === collapsed && !force) {
        return;
      }

      clearTimeout(this._collapseAnimationTimeout);

      this._collapsed = collapsed;

      if (collapsed) {
        this.removeAllMarkers();
      } else {
        this.drawMarkers();
      }

      // Разворачивание карты производится убиранием класса map-hidden
      // у блока карты. В этом состоянии она занимает 100% от высоты экрана.
      // Чтобы остальные блоки не мешали ей, для body добавляется класс
      // map-mode, для которого каскадом прописано схлопывание всех остальных
      // блоков до нулевой высоты.
      this.el.classList.toggle('map-hidden', collapsed);
      document.body.classList.toggle('map-mode', !collapsed);

      // Таймаут используется для отправки карте события изменения ее размеров,
      // чтобы она подогнала вьюпорт под новый размер отведенного ей блока.
      // Обычно карта следит за изменениями размера окна, но о любом другом
      // изменении размеров ее блока, ее нужно уведомлять отдельно.
      // NB! Этот способ достаточно кондовый и представляет собой решение "в лоб".
      // Более изящное решение в этом случае: добавить обработчик события
      // transitionend. Однако, в этом случае нужна дополнительная проверка,
      // поддерживает ли браузер transition и вызывать ресайз немедленно.
      this._collapseAnimationTimeout = setTimeout(function() {
        google.maps.event.trigger(this.map, 'resize');
      }.bind(this), ANIMATION_DURATION);
    },

    /**
     * Показ на карте всех не отрисованных маркеров.
     */
    drawMarkers: function() {
      this._markers.forEach(function(marker) {
        if (!marker.isRendered()) {
          marker.render(this.map);
        }
      }, this);
    },

    /**
     * Удаление всех отрисованных маркеров.
     */
    removeAllMarkers: function() {
      this._markers.forEach(function(marker) {
        if (marker.isRendered()) {
          marker.remove();
        }
      });
    }
  });

  return MapView;
});
