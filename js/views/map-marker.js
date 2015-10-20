/* global google: true _: true define: true */

'use strict';

define([
  'views/marker'
], function(MarkerView) {
  /**
   * @constructor
   * @extends {MarkerView}
   */
  var HotelMarkerView = MarkerView.extend({
    /** @override */
    getInitialIconOptions: function() {
      return {
        anchor: new google.maps.Point(8, 8),
        scaledSize: new google.maps.Size(16, 16),
        size: new google.maps.Size(28, 28),
        url: 'img/marker-icon.png'
      };
    },

    /** @override */
    getHoverIconOptions: function() {
      return _.extend(this.getInitialIconOptions(), {
        anchor: new google.maps.Point(14, 14),
        scaledSize: new google.maps.Size(28, 28)
      });
    }
  });

  return HotelMarkerView;
});
