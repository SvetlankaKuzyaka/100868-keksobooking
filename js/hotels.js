'use strict';

(function() {
  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
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

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 9;

  var hotelsContainer = document.querySelector('.hotels-list');
  var hotels;
  var currentHotels;
  var currentPage = 0;

  function renderHotels(hotelsToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      hotelsContainer.classList.remove('hotels-list-failure');
      hotelsContainer.innerHTML = '';
    }

    var hotelTemplate = document.getElementById('hotel-template');
    var hotelsFragment = document.createDocumentFragment();

    var hotelsFrom = pageNumber * PAGE_SIZE;
    var hotelsTo = hotelsFrom + PAGE_SIZE;
    hotelsToRender = hotelsToRender.slice(hotelsFrom, hotelsTo);

    hotelsToRender.forEach(function(hotel) {
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
        }, REQUEST_FAILURE_TIMEOUT);

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

  function showLoadFailure() {
    hotelsContainer.classList.add('hotels-list-failure');
  }

  function loadHotels(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/hotels-xhr.json');
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
          if (xhr.status === 200) {
            var data = loadedXhr.response;
            hotelsContainer.classList.remove('hotels-list-loading');
            callback(JSON.parse(data));
          }

          if (xhr.status > 400) {
            showLoadFailure();
          }
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };
  }

  function filterHotels(hotelsToFilter, filterID) {
    var filteredHotels = hotelsToFilter.slice(0);
    switch (filterID) {
      case 'sort-by-price-asc':
        filteredHotels = filteredHotels.sort(function(a, b) {
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

      case 'sort-by-price-desc':
        filteredHotels = filteredHotels.sort(function(a, b) {
          if (a.price > b.price) {
            return -1;
          }

          if (a.price < b.price) {
            return 1;
          }

          if (a.price === b.price) {
            return 0;
          }
        });

        break;

      default:
        filteredHotels = hotelsToFilter.slice(0);
        break;
    }

    localStorage.setItem('filterID', filterID);
    return filteredHotels;
  }

  function initFilters() {
    var filtersContainer = document.querySelector('.hotels-filters');

    filtersContainer.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;
      setActiveFilter(clickedFilter.id);

      document.querySelector('.hotel-filter-selected').classList.remove('hotel-filter-selected');
      clickedFilter.classList.add('hotel-filter-selected');
    });
  }

  function setActiveFilter(filterID) {
    currentHotels = filterHotels(hotels, filterID);
    currentPage = 0;
    renderHotels(currentHotels, currentPage, true);
  }

  function isNextPageAvailable() {
    return currentPage < Math.ceil(hotels.length / PAGE_SIZE);
  }

  function isAtTheBottom() {
    var GAP = 100;
    return hotelsContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  function initScroll() {
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderHotels(currentHotels, currentPage++, false);
    });
  }

  initFilters();
  initScroll();

  loadHotels(function(loadedHotels) {
    hotels = loadedHotels;
    setActiveFilter(localStorage.getItem('filterID') || 'sort-hotels-default');
  });
})();
