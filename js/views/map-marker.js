/* global google: true */

'use strict';

(function() {
  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var HotelMarkerView = Backbone.View.extend({
    /** @override */
    initialize: function() {
      this.el = new google.maps.Marker({
        position: new google.maps.LatLng(
            this.model.get('location').lat,
            this.model.get('location').lng),
        title: this.model.get('name')
      });
    },

    /**
     * @param {google.maps.Map} map
     * @override
     */
    render: function(map) {
      this.el.setMap(map);
    },

    /** @override */
    remove: function() {
      this.el.setMap(null);
      Backbone.View.prototype.remove.call(this);
    }
  });

  window.HotelMarkerView = HotelMarkerView;
})();
