'use strict';

define(function() {
  /**
   * @constructor
   * @extends {Backbone.Collection}
   */
  var POICollection = Backbone.Collection.extend({
    url: 'data/poi.json'
  });

  return POICollection;
});
