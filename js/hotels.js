(function() {
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
    '9': 'hotel-rating-nine',
  };

  var IMAGE_FAILURE_TIMEOUT = 10000;

  var hotelsContainer = document.querySelector('.hotels-list');
  var hotelTemplate = document.getElementById('hotel-template');

  var hotelsFragment = document.createDocumentFragment();

  hotels.forEach(function(hotel, i) {
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
      }

      hotelBackground.onerror = function(evt) {
        newHotelElement.classList.add('hotel-nophoto');
      };
    }
  });

  hotelsContainer.appendChild(hotelsFragment);
})();
