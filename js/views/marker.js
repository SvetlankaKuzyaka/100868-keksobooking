/* global google: true */

'use strict';

define(function() {
  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var MarkerView = Backbone.View.extend({
    /**
     * Тип MarkerView — хороший пример использования представления объекта
     * без DOM'a. View по-прежнему описывает как объект выглядит на странице
     * и как он себя ведет в ответ на пользовательские изменения, но при этом
     * его представление в DOM'e это не элемент, а класс google.maps.Marker.
     * @override
     */
    initialize: function() {
      this.el = new google.maps.Marker(this.getMarkerOptions());
    },

    /**
     * @param {google.maps.Map} map
     * @override
     */
    render: function(map) {
      this.el.setMap(map);

      // Маркеры google карт не дают доступа к html объектам, потому
      // что реализация может меняться: это может быть канвас, элементы
      // и другие способы, поэтому вместо работы с css, все состояния
      // приходится обновлять в обработчиках. Методы this.getHoverIconOptions
      // и getInitialIconOptions возвращают объект в состоянии наведения
      // и состоянии покоя соответственно.
      google.maps.event.addListener(this.el, 'mouseover', function() {
        this.el.setIcon(this.getHoverIconOptions());
        this.el.setZIndex(1);
      }.bind(this));

      google.maps.event.addListener(this.el, 'mouseout', function() {
        this.el.setIcon(this.getInitialIconOptions());
        this.el.setZIndex(0);
      }.bind(this));
    },

    /** @override */
    remove: function() {
      this.el.setMap(null);
      google.maps.event.clearInstanceListeners(this.el);
      Backbone.View.prototype.remove.call(this);
    },

    /**
     * NB! Вместо хранения объекта с параметрами в прототипе используется
     * метод по двум причинам. Во-первых в момент инициализации прототипа
     * не будет объявлен объект google, т.е. не будут загружены гугл-карты.
     * Инициализация объекта с картой происходит после загрузки API карт,
     * поэтому обращение к этому объекту последует когда все нужные методы
     * уже загружены. Во-вторых ленивая инициализация (т.е. инициализация)
     * после первого запроса экономит память, потому что объект, возвращаемый
     * этим методом не будет храниться все время, а будет создан только
     * в момент запроса.
     * @return {google.maps.MarkerOptions}
     */
    getMarkerOptions: function() {
      return {
        cursor: 'pointer',
        clickable: true,
        draggable: false,
        // Объект, описывающий изначальное состояние иконки берется из метода
        // getInitialIconOptions. Поэтому в объектах наследниках достаточно
        // описать этот объект, чтобы получить нужную иконку. Тут достаточно
        // абстрактного описания поведения.
        icon: this.getInitialIconOptions(),
        position: new google.maps.LatLng(
            this.model.get('location').lat,
            this.model.get('location').lng),
        title: this.model.get('name')
      };
    },

    /**
     * @return {google.maps.Icon}
     */
    getHoverIconOptions: function() {
      return {};
    },

    /**
     * @return {google.maps.Icon}
     */
    getInitialIconOptions: function() {
      return {};
    },

    /**
     * Проверяет, отрисован ли элемент на карте.
     * @return {boolean}
     */
    isRendered: function() {
      return !!this.el.getMap();
    }
  });

  return MarkerView;
});
