/* global Backbone: true HotelModel: true */

'use strict';

(function() {
  /**
   * @constructor
   * @param {Object} attributess
   * @param {Object} options
   */
  var HotelsCollection = Backbone.Collection.extend({
    model: HotelModel,
    url: 'data/hotels.json'
  });

  window.HotelsCollection = HotelsCollection;
})();
