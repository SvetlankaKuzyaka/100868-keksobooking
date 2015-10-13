/* global Backbone: true HotelModel: true */

'use strict';

(function() {
  /**
   * @constructor
   * @param {Object} attributes
   * @param {Object} options
   */
  var HotelsCollection = Backbone.Collection.extend({
    model: HotelModel,
    url: 'data/hotels-xhr.json'
  });

  window.HotelsCollection = HotelsCollection;
})();
