'use strict';

(function() {
  var GalleryPicture = Backbone.View.extend({
    tagName: 'img',

    render: function() {
      this.el.src = this.model.get('url');
    }
  });

  window.GalleryPicture = GalleryPicture;
})();
