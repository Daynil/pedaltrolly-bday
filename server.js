'use strict';
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIP_TEST_KEY);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

mongoose.connect(process.env.MONGO_URL, err =>
  console.log('connect error', err, ' mongourl: ', process.env.MONGO_URL)
);

let attendeesSchema = new mongoose.Schema({
  people: [{ person: String }]
});

let Attendees = mongoose.model('Attendees', attendeesSchema);

app.use(bodyParser.json());
app.use(morgan('dev'));
let pathname = path.join(process.cwd());
app.use(express.static(pathname));

app.get('/list', (req, res) => {
  Attendees.findOne({})
    .exec()
    .then(list => {
      res.status(200).json(list);
    });
});

app.post('/charge', (req, res) => {
  let stripeToken = req.body.stripeToken.id;
  let attendeeName = req.body.name;

  let charge = stripe.charges.create(
    {
      amount: 3500,
      currency: 'usd',
      source: stripeToken,
      description: 'trolley seat reservation'
    },
    (err, charge) => {
      if (err && err.type === 'StripeCardError') {
        console.log('Card declined', err);
        let mailOptions = {
          from: 'Danny at Goldenbot Studios',
          to: 'omegasol11@gmail.com',
          subject: 'Card Charge Error',
          text: `Card charge error: ${err.toString()}. Charge attempt by ${attendeeName}.`
        };
        sgMail
          .send(mailOptions)
          .then(sent => console.log('message sent', sent))
          .catch(err => console.log('message error', err));
      } else {
        let mailOptions = {
          from: 'Danny at Goldenbot Studios',
          to: 'omegasol11@gmail.com, lilescapade@gmail.com',
          subject: 'Trolley Seat Reserved',
          text: `Payment received from ${attendeeName}, their email address: ${
            charge.source.name
          }`
        };
        sgMail
          .send(mailOptions)
          .then(sent => console.log('message sent', sent))
          .catch(err => console.log('message error', err));
        res.status(200).end();
      }
    }
  );
});

app.post('/:name', (req, res) => {
  console.log('at name route ', req.params.name);
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
        console.log('we are at attendees', req.params.name);
        attendees.people.push({ person: req.params.name });
        attendees.save(err => {
          if (err) res.status(400).end('**save err: ', err);
          else res.status(200).end('added attendee successfully');
        });
      }
    });
});
let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
