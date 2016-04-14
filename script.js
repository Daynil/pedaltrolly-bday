'use strict';
let inputField;
let spots;
let tooltip;
const maxPeople = 15;
window.onload = init();

function init() {
	inputField = document.getElementById('name');
	inputField.addEventListener('input', typing);
	spots = document.getElementById('spots-left');
	tooltip = document.getElementById('tooltip');
	
	if (parseInt(spots.innerHTML === 0)) tooltip.className = ''; 
	document.getElementById('reserve').onclick = reserveClick;
}

function addAttendee(name) {
	let spotsLeft = parseInt(spots.innerHTML);
	spotsLeft--;
	spots.innerText = spotsLeft;
	let peopleAttending = maxPeople - spotsLeft;
	
	let person = document.createElement('p');
	person.innerText = `${peopleAttending}. ${name}`;
	let container;
	if (peopleAttending <= 5) container = document.getElementById('col1');
	else if (peopleAttending > 5 && peopleAttending <= 10) container = document.getElementById('col2');
	else container = document.getElementById('col3');
	container.appendChild(person);
}

function reserveClick() {
	let name = inputField.value;
	if (name.length < 3) {
		inputField.className = 'error';
	} else {
		addAttendee(name);
		inputField.value = '';
	}
}

function typing(e) {
	if (inputField.className === 'error') {
		if (inputField.value.length > 2) inputField.className = '';
	}
}