'use strict';

(function() {
  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var HotelModel = Backbone.Model.extend({
    /** @override */
    initialize: function() {
      this.set('liked', false);
    },

    like: function() {
      this.set('liked', true);
    },

    dislike: function() {
      this.set('liked', false);
    }
  });

  window.HotelModel = HotelModel;
})();
