/* global google: true */

'use strict';

var __mapsRegisteredCallbacks = [];

function initMap(callback) {
  if (callback) {
    __mapsRegisteredCallbacks.push(callback);
    return;
  }

  var callbacksToExec = __mapsRegisteredCallbacks.slice(0);

  while ((callback = callbacksToExec.shift())) {
    callback.call(null);
  }
}

(function() {
  var map;

  initMap(function() {
    map = new google.maps.Map(document.querySelector('.map-container'), {
      center: new google.maps.LatLng(35.41, 139.41),
      scrollwheel: false,
      zoom: 12
    });
  });

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var HotelMarkerView = Backbone.View.extend({
    /**
     * @param {Map} container
     */
    render: function(container) {
      var el = document.createElementNs(null, 'div');
      container.appendChild(el);

      map.appendChild(container);
    }
  });

  window.HotelMarkerView = HotelMarkerView;
})();
