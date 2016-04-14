'use strict';
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const stripe = require('stripe')('sk_test_ReU5x6jZv86zuO9ul6XSEJnO');
mongoose.connect('mongodb://daynil:d49nDcm%bYO%$d8C@ds023530.mlab.com:23530/trolley-list');

let attendeesSchema = new mongoose.Schema({
	people: [{ person: String }]
});

let Attendees = mongoose.model('Attendees', attendeesSchema);

app.use(bodyParser.json());
app.use(morgan('dev'));
let pathname = path.join(process.cwd());
app.use( express.static(pathname) );

app.get('/list', (req, res) => {
	Attendees.findOne({})
		.exec()
		.then(list => {
			res.status(200).json(list);
		});
});


app.post('/charge', (req, res) => {
	let stripeToken = req.body.stripeToken.id;
	
	let charge = stripe.charges.create({
			amount: 2000,
			currency: 'usd',
			source: stripeToken,
			description: 'trolley seat reservation'
		}, (err, charge) => {
			if (err && err.type === 'StripeCardError') {
				console.log('Card declined', err);
			} else {
				console.log('Charge success: ', charge);
				res.status(200).end();
			};
		});
});

app.post('/:name', (req, res) => {
	Attendees.findOne({})
		.exec()
		.then(attendees => {
			if (attendees === null) {
				let newAttendees = new Attendees({
					people: [{ person: req.params.name }]
				});	
				newAttendees.save(err => {
					if (err) console.log(err);
				});
			} else {
				attendees.people.push({ person: req.params.name });
				attendees.save(err => {
					if (err) res.status(400).end(err);
					else res.status(200).end('added attendee successfully');
				});
			}
		});
});
let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));