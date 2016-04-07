// BASE SETUP
// ============================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/grabit');

// importing models
var Ad = require('./app/models/ad.js');
var Location = require('./app/models/location.js');
var User = require('./app/models/user.js');

var port = process.env.port || 8080; // set our port

// ROUTES FOR OUR API
// ===========================
var router = express.Router(); // get an instance of the express router

// middleware to use for all requests
router.use(function (req, res, next) {
	// do logging
	console.log('Something is happening');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything's workin'
router.get('/', function(req, res) {
	res.json({ message: "cheers" });
});

// Custom routes

// on routes that end in /ads
// ---------------------------
router.route('/ads')

	// create an ad (accessed at POST '/api/ads')
	.post(function (req, res) {
		
		var ad = new Ad(); // Create a new instance of the Ad model
		ad.title = req.body.title;
		ad.price = req.body.price;
		ad.description = req.body.description;
		
		// save the ad and check for errors
		ad.save(function (err) {
			if (err) { res.send(err); }
			
			res.json({ message: 'Ad created' });
		});
		
	})
	
	// get all the ads (accessed at GET '/api/ads')
	.get(function (req, res) {
		Ad.find( function(err, ads) {
			if (err) { res.send(err); }
			
			res.json(ads);
		});
	});

// REGISTER OUR ROUTES -----------
// all of our routes will be prefixed with '/api'
app.use('/api', router);

// START THE SERVER
// ===========================
app.listen(port);
console.log('Magic happens on port ' + port);





