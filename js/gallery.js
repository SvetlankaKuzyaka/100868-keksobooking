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
      element = element.parentElement;
    } while (element);

    return false;
  }

  function hideGallery() {
    galleryElement.classList.add('hidden');
    closeButton.removeEventListener('click', closeHandler);
    document.body.removeEventListener('keydown', keyHandler);
  }

  function closeHandler(evt) {
    evt.preventDefault();
    hideGallery();
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
        hideGallery();
        break;
      default: break;
    }
  }

  function showGallery() {
    galleryElement.classList.remove('hidden');
    closeButton.addEventListener('click', closeHandler);
    document.body.addEventListener('keydown', keyHandler);
  }

  hotelsContainer.addEventListener('click', function(evt) {
    if (doesHaveParent(evt.target, 'hotel')) {
      showGallery();
    }
  });
})();
