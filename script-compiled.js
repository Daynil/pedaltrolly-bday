'use strict';

var inputField = void 0;
var tooltip = void 0;
var spots = void 0;
var spotsLeft = void 0;
var maxPeople = 15;
var stripeHandler = void 0;
window.onload = init();

function init() {
  inputField = document.getElementById('name');
  inputField.addEventListener('input', typing);
  spots = document.getElementById('spots-left');
  tooltip = document.getElementById('tooltip');

  document.getElementById('reserve-focus').onclick = focus;

  configureStripeHandler();
  document.getElementById('reserve').onclick = reserveClick;

  getDatabaseList();
}

function focus(e) {
  e.preventDefault();
  inputField.focus();
}

function getDatabaseList() {
  axios.get('/list').then(function (res) {
    console.log(res);
    spotsLeft = maxPeople - res.data.people.length;
    spots.innerText = spotsLeft;
    if (spotsLeft === 0) tooltip.className = '';
    clearOldList();
    res.data.people.forEach(function (item, index, arr) {
      addAttendee(index + 1, item.person);
    });
  });
}

function addToDatabase(name) {
  axios.post('/' + name).then(function (res) {
    getDatabaseList();
  }).catch(function (err) {
    return console.log(err);
  });
}

function clearOldList() {
  for (var i = 1; i <= 3; i++) {
    var listContainer = document.getElementById('col' + i);
    while (listContainer.firstChild) {
      listContainer.removeChild(listContainer.firstChild);
    }
  }
}

function addAttendee(index, name) {
  var person = document.createElement('p');
  person.innerText = index + '. ' + name;
  var container = void 0;
  if (index <= 5) container = document.getElementById('col1');else if (index > 5 && index <= 10) container = document.getElementById('col2');else container = document.getElementById('col3');
  container.appendChild(person);
}

function reserveClick() {
  var name = inputField.value;
  if (name.length < 3) {
    inputField.className = 'error';
  } else if (spotsLeft === 0) {
    tooltip.className = 'remind';
  } else {
    stripeHandler.open({
      name: 'Birthday Trolley',
      description: 'Reserve Seat',
      amount: 3500
    });
  }
}

function configureStripeHandler() {
  stripeHandler = StripeCheckout.configure({
    key: 'pk_test_Z8enCS948sTYByyBceMPsHFJ',
    token: function token(_token) {
      var name = inputField.value;
      axios.post('/charge', { stripeToken: _token, name: name }).then(function (res) {
        if (res.status === 200) {
          addToDatabase(name);
          inputField.value = '';
        }
      });
    }
  });
}

function typing(e) {
  if (inputField.className === 'error') {
    if (inputField.value.length > 2) inputField.className = '';
  }
}
