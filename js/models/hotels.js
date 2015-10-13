/* global Backbone: true */

'use strict';

(function() {
  /**
   * @constructor
   * @param {Object} attributes
   * @param {Object} options
   */
  var HotelsCollection = Backbone.Collection.extend({
    url: 'data/hotels-xhr.json'
  });

  window.HotelsCollection = HotelsCollection;
})();
