'use strict';
require('./styles.css');
const d3 = require('d3');
window.onload = init();

function init() {
	d3.select('body').append('p').text('New Paragraph!');
}