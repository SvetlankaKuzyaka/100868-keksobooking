/* global
    google: true
    define: true
    _: true  */

'use strict';

define([
  'views/marker'
], function(MarkerView) {
  /**
   * @constructor
   * @extends {MarkerView}
   */
  var POIMarkerView = MarkerView.extend({
    /** @override */
    getInitialIconOptions: function() {
      return {
        anchor: new google.maps.Point(18, 18),
        scaledSize: new google.maps.Size(36, 36),
        size: new google.maps.Size(47, 47),
        url: 'img/marker-attraction-icon.png'
      };
    },

    /** @override */
    getHoverIconOptions: function() {
      return _.extend(this.getInitialIconOptions(), {
        anchor: new google.maps.Point(23, 23),
        scaledSize: new google.maps.Size(47, 47)
      });
    }
  });

  return POIMarkerView;
});
