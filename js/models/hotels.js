/* global
    define: true
*/

'use strict';

define([
  'js/models/hotel.js'
], function(HotelModel) {
  /**
   * @constructor
   * @param {Object} attributess
   * @param {Object} options
   */
  var HotelsCollection = Backbone.Collection.extend({
    model: HotelModel,
    url: 'data/hotels.json'
  });

  return HotelsCollection;
});
