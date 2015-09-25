'use strict';

(function() {
  function addLeadingZero(value) {
    if (value < 10) {
      return '0' + value;
    }

    return '' + value;
  }

  function getFormattedDate(date) {
    if (typeof date === 'undefined') {
      date = new Date();
    }

    var fullMonth = addLeadingZero(date.getMonth() + 1);
    var fullDate = addLeadingZero(date.getDate());

    return [date.getFullYear(), fullMonth, fullDate].join('-');
  }

  function restoreFormValueFromCookies(form) {
    var element;
    for (var i = 0, l = form.elements.length; i < l; i++) {
      element = form.elements[i];

      if (docCookies.hasItem(element.name)) {
        element.value = docCookies.getItem(element.name);
      }
    }
  }

  var formElement = document.forms['searchform'];

  var dateFrom = formElement['form-from'];
  var dateTo = formElement['form-to'];
  var guestsNumber = formElement['searchform-guests-number'];
  var roomsNumber = formElement['searchform-guests-rooms'];

  var MAX_GUESTS_PER_ROOM = 3;
  var MIN_GUESTS_PER_ROOM = 1;
  var MILLISECONDS_IN_DAY = 60 * 60 * 24 * 1000;

  var minimalDifference = MILLISECONDS_IN_DAY;

  dateFrom.min = getFormattedDate();
  guestsNumber.min = roomsNumber.min = 1;

  dateFrom.value = getFormattedDate();
  dateTo.value = getFormattedDate(new Date(new Date(dateFrom.value) + minimalDifference));
  guestsNumber.value = 2;
  roomsNumber.value = 1;

  restoreFormValueFromCookies(formElement);

  dateFrom.onchange = function() {
    var dateFromValue = new Date(dateFrom.value);
    var dateToValue = new Date(dateTo.value);
    var minimalToDate = getFormattedDate(new Date(+dateFromValue + minimalDifference));

    if (dateToValue - dateFromValue < minimalDifference) {
      dateTo.value = minimalToDate;
    }

    dateTo.min = minimalToDate;
  };

  guestsNumber.onchange = function() {
    roomsNumber.min = parseInt(parseInt(guestsNumber.value, 10) / MAX_GUESTS_PER_ROOM, 10);
    roomsNumber.max = parseInt(parseInt(guestsNumber.value, 10) / MIN_GUESTS_PER_ROOM, 10);
  };

  roomsNumber.onchange = function() {
    guestsNumber.min = parseInt(roomsNumber.value, 10) * MIN_GUESTS_PER_ROOM;
    guestsNumber.max = parseInt(roomsNumber.value, 10) * MAX_GUESTS_PER_ROOM;
  };

  formElement.onsubmit = function(evt) {
    evt.preventDefault();

    var element;
    for (var i = 0, l = formElement.elements.length; i < l; i++) {
      element = formElement.elements[i];
      docCookies.setItem(element.name, element.value);
    }

    formElement.submit();
  };
})();
