'use strict';
let inputField;
let tooltip;
let spots;
let spotsLeft;
const maxPeople = 15;
let stripeHandler;
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
	axios.get('/list')
		.then(res => {
			console.log(res);
			spotsLeft = maxPeople - res.data.people.length;
			spots.innerText = spotsLeft;
			if (spotsLeft === 0) tooltip.className = '';
			clearOldList();
			res.data.people.forEach((item, index, arr) => {
				addAttendee(index+1, item.person);
			})
		});
}

function addToDatabase(name) {
	axios.post(`/${name}`)
		.then(res => {
			console.log(res);
			getDatabaseList();
		})
		.catch(err => console.log(err));
}

function clearOldList() {
	for (let i = 1; i <= 3; i++) {
		let listContainer = document.getElementById(`col${i}`);
		while (listContainer.firstChild) {
			listContainer.removeChild(listContainer.firstChild);
		}
	}
}

function addAttendee(index, name) {	
	let person = document.createElement('p');
	person.innerText = `${index}. ${name}`;
	let container;
	if (index <= 5) container = document.getElementById('col1');
	else if (index > 5 && index <= 10) container = document.getElementById('col2');
	else container = document.getElementById('col3');
	container.appendChild(person);
}

function reserveClick() {
	let name = inputField.value;
	if (name.length < 3) {
		inputField.className = 'error';
	} else if (spotsLeft === 0) {
		tooltip.className = 'remind';
	} else {
		stripeHandler.open({
			name: 'Birthday Trolley',
			description: 'Reserve Seat',
			amount: 2000
		});
	}
}

function configureStripeHandler() {
	stripeHandler = StripeCheckout.configure({
		key: 'pk_live_H7xrRnKOLn0Lyx83bKu02wQC',
		token: token => {
			let name = inputField.value;
			axios
				.post('/charge', { stripeToken: token, name: name })
				.then(res => {
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