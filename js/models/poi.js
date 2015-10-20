'use strict';

(function() {
  /**
   * @constructor
   * @extends {Backbone.Collection}
   */
  var POICollection = Backbone.Collection.extend({
    url: 'data/poi.json'
  });

  window.POICollection = POICollection;
})();
