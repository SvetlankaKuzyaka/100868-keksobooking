/* eslint globals:{hotels:true} */

'use strict';

(function() {
  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4,
  };

  var amenityClassName = {
    'breakfast': 'hotel-amenity-breakfast',
    'parking': 'hotel-amenity-parking',
    'wifi': 'hotel-amenity-wifi'
  };

  var starsClassName = {
    '1': 'hotel-stars',
    '2': 'hotel-stars-two',
    '3': 'hotel-stars-three',
    '4': 'hotel-stars-four',
    '5': 'hotel-stars-five'
  };

  var ratingClassName = {
    '4': 'hotel-rating-four',
    '5': 'hotel-rating-five',
    '6': 'hotel-rating-six',
    '7': 'hotel-rating-seven',
    '8': 'hotel-rating-eight',
    '9': 'hotel-rating-nine'
  };

  var IMAGE_FAILURE_TIMEOUT = 10000;
  var hotelsContainer = document.querySelector('.hotels-list');
  var hotels;

  function renderHotels(hotels) {
    var hotelTemplate = document.getElementById('hotel-template');
    var hotelsFragment = document.createDocumentFragment();

    hotels.forEach(function(hotel) {
      var newHotelElement = hotelTemplate.content.children[0].cloneNode(true);
      var amenitiesContainer = newHotelElement.querySelector('.hotel-amenities');

      newHotelElement.querySelector('.hotel-stars').classList.add(starsClassName[hotel['stars']]);
      newHotelElement.querySelector('.hotel-name').textContent = hotel['name'];
      newHotelElement.querySelector('.hotel-distance-kilometers').textContent = [hotel['distance'], 'км'].join(' ');
      newHotelElement.querySelector('.hotel-price-value').textContent = hotel['price'];
      newHotelElement.querySelector('.hotel-rating').textContent = hotel['rating'];
      newHotelElement.querySelector('.hotel-rating').classList.add(ratingClassName[Math.floor(hotel['rating'])]);

      hotel['amenities'].forEach(function(amenity) {
        var amenityElement = document.createElement('li');
        amenityElement.classList.add('hotel-amenity');
        amenityElement.classList.add(amenityClassName[amenity]);
        amenitiesContainer.appendChild(amenityElement);
      });

      hotelsFragment.appendChild(newHotelElement);

      if (hotel['preview']) {
        var hotelBackground = new Image();
        hotelBackground.src = hotel['preview'];

        var imageLoadTimeout = setTimeout(function() {
          newHotelElement.classList.add('hotel-nophoto');
        }, IMAGE_FAILURE_TIMEOUT);

        hotelBackground.onload = function() {
          newHotelElement.style.backgroundImage = 'url(\'' + hotelBackground.src + '\')';
          newHotelElement.style.backgroundSize = '100% auto';
          clearTimeout(imageLoadTimeout);
        };

        hotelBackground.onerror = function() {
          newHotelElement.classList.add('hotel-nophoto');
        };
      }
    });

    hotelsContainer.appendChild(hotelsFragment);
  }

  function loadHotels(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', '/data/hotels-xhr.json', true);
    xhr.send();

    xhr.onreadystatechange = function(evt) {
      var loadedXhr = evt.target;

      switch (loadedXhr.readyState) {
        case ReadyState.OPENED:
        case ReadyState.HEADERS_RECEIVED:
        case ReadyState.LOADING:
          hotelsContainer.classList.add('hotels-list-loading');
          break;

        case ReadyState.DONE:
        default:
          var data = loadedXhr.response;
          callback(JSON.parse(data));
          break;
      }
    };
  }

  function filterHotels(hotels, filterID) {
    var filteredHotels = hotels.slice(0);
    switch (filterID) {
      case 'sort-by-price-asc':
        filteredFotels = filteredHotels.sort(function(a, b) {
          if (a.price > b.price || (b.price && a.price === 0)) {
            return 1;
          }

          if (a.price < b.price || (a.price && b.price === 0)) {
            return -1;
          }

          if (a.price === b.price) {
            return 0;
          }
        });

        break;
    }

    return filteredHotels;
  }

  loadHotels(function(loadedHotels) {
    hotels = loadedHotels;
    var filteredHotels = filterHotels(hotels, 'sort-by-price-asc');
    renderHotels(filteredHotels);
  });
})();
