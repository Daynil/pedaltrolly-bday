'use strict';
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const stripe = require('stripe')(process.env.STRIP_KEY);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    auth: {
      user: process.env.MONGO_USER,
      password: process.env.MONGO_PASS
    }
  },
  err => {
    if (err)
      console.log('connect error', err, ' mongourl: ', process.env.MONGO_URL);
  }
);

let attendeesSchema = new mongoose.Schema({
  people: { person: [String] }
});

let Attendees = mongoose.model('Attendees', attendeesSchema);

app.use(cors());
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
        // let mailOptions = {
        //   from: 'Danny at Goldenbot Studios',
        //   to: 'omegasol11@gmail.com',
        //   subject: 'Card Charge Error',
        //   text: `Card charge error: ${err.toString()}. Charge attempt by ${attendeeName}.`,
        //   html: 'html'
        // };
        // sgMail
        //   .send(mailOptions)
        //   .then(sent => console.log('message sent', sent))
        //   .catch(err => console.log('message error', err));
      } else {
        // let mailOptions = {
        //   from: 'Danny at Goldenbot Studios',
        //   to: ['omegasol11@gmail.com', 'lilescapade@gmail.com'],
        //   subject: 'Trolley Seat Reserved',
        //   text: `Payment received from ${attendeeName}, their email address: ${
        //     charge.source.name
        //   }`,
        //   html: 'html'
        // };
        // sgMail
        //   .send(mailOptions)
        //   .then(sent => console.log('message sent', sent))
        //   .catch(err => console.log('message error', err));
        console.log('payed: ', charge.source.name);
        res.status(200).end();
      }
    }
  );
});

app.post('/:name', (req, res) => {
  console.log('at name route ', req.params.name);
  Attendees.findOneAndUpdate(
    {},
    {
      $push: {
        people: {
          person: req.params.name
        }
      }
    }
  )
    .exec()
    .then(done => {
      console.log('saved ', done);
      res.status(200).end('added attendee successfully');
    })
    .catch(err => {
      console.log('** save error: ', err);
    });
});
let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
