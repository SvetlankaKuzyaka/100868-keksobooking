/**
 * @type {Array.<function>}
 */
var __mapsRegisteredCallbacks = [];

/**
 * @param {function} callback
 */
function initMap(callback) {
  if (callback) {
    __mapsRegisteredCallbacks.push(callback);
    return;
  }

  var callbacksToExec = __mapsRegisteredCallbacks.slice(0);

  while ((callback = callbacksToExec.shift())) {
    callback();
  }
}

(function() {
  /**
   * @const
   * @type {{ lat: number, lng: number }}
   */
  var TOKIO_CENTER = {
    lat: 35.6833,
    lng: 139.6833
  };

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var MapView = Backbone.View.extend({
    /** @override */
    initialize: function() {
      this._markers = [];
      this._collapsed = true;
      this._onClick = this._onClick.bind(this);
    },

    /** @override */
    events: {
      'click': '_onClick'
    },

    /** @override */
    render: function() {
      this._mapContainer = this.el.querySelector('.map-container');

      if (!this._mapContainer) {
        throw new Exception('There is no container for Google Map. Probably setElement hasn\'t been ' +
        'called on this element before render.');
      }

      this.map = new google.maps.Map(this._mapContainer, {
        center: new google.maps.LatLng(TOKIO_CENTER.lat, TOKIO_CENTER.lng),
        scrollwheel: false,
        zoom: 12
      });

      this.collection.forEach(function(item) {
        var marker = new HotelMarkerView({model: item});
        this._markers.push(marker);
      }, this);
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onClick: function(evt) {
      if (evt.target.classList.contains('map-switch')) {
        this.setCollapsed(!this._collapsed);
      }
    },

    /**
     * @param {boolean} collapsed
     * @param {=boolean} force
     */
    setCollapsed: function(collapsed, force) {
      if (this._collapsed === collapsed && !force) {
        return;
      }

      this._collapsed = collapsed;
      var newSize;

      if (collapsed) {
        newSize = '68px';
        var markersLen = this._markers.length;
        while (markersLen--) {
          this._markers[markersLen].remove();
        }
      } else {
        newSize = '1000px';
        this._markers.forEach(function(marker) {
          marker.render(this.map);
        }, this);
      }

      this.el.style.height = this._mapContainer.style.height = newSize;
      google.maps.event.trigger(this.map, 'resize');
    }
  });

  window.MapView = MapView;
})();
