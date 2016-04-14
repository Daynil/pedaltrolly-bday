'use strict';
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.connect('mongodb://daynil:d49nDcm%bYO%$d8C@ds019688.mlab.com:19688/trolley-list');

let attendeesSchema = new mongoose.Schema({
	person: String
});

let Attendee = mongoose.model('Attendee', attendeesSchema);

app.use(morgan('dev'));
let pathname = path.join(process.cwd());
app.use( express.static(pathname) );

app.get('/list', (req, res) => {
	Attendee.find({})
		.exec()
		.then(list => res.status(200).end(list.toString()));
});

app.post('/:name', (req, res) => {
	let attendee = new Attendee({
		person: req.params.name
	});
	
	attendee.save( (err) => {
		if (err) res.status(400).json( {'error': err});
		else res.status(200).end();
	})
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));