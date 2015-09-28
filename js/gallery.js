'use strict';

(function() {
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };

  var hotelsContainer = document.querySelector('.hotels-list');
  var galleryElement = document.querySelector('.gallery-overlay');
  var closeButton = galleryElement.querySelector('.gallery-overlay-close');

  function doesHaveParent(element, className) {
    do {
      if (element.classList.contains(className)) {
        return !element.classList.contains('hotel-nophoto');
      }
    } while ((element = element.parentElement));

    return false;
  }

  function hideGallery() {
    galleryElement.classList.add('hidden');
    closeButton.removeEventListener('click');
    // Make a statement about keyHandler and why is it possible
    // to use it even before it was defined.
    document.body.removeEventListener('keydown', keyHandler);
  }

  function showGallery() {
    galleryElement.classList.remove('hidden');
    closeButton.addEventListener('click', function(evt) {
      evt.preventDefault();
      hideGallery();
    });
    document.body.addEventListener('keydown', keyHandler);
  }

  function keyHandler(evt) {
    switch (evt.keyCode) {
      case Key.LEFT:
        console.log('show previous photo');
        break;
      case Key.RIGHT:
        console.log('show next photo');
        break;
      case Key.ESC:
      default:
        hideGallery();
        break;
    }
  }

  hotelsContainer.addEventListener('click', function(evt) {
    if (doesHaveParent(evt.target, 'hotel')) {
      showGallery();
    }
  });
})();
