// BASE SETUP
// ============================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var http = require('http');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure database
var mongoose = require('mongoose');

if (process.env.NODE_ENV == 'development') {
	mongoose.connect('mongodb://localhost/grabit');
} else {
	mongoose.connect("mongodb://admin:4eH8pNKf31Kz@" + process.env.OPENSHIFT_MONGODB_DB_HOST + ":$OPENSHIFT_MONGODB_DB_PORT/grabit");
}

// importing models
var Ad = require('./app/models/ad.js');
var Category = require('./app/models/category.js');
var City = require('./app/models/city.js');
var County = require('./app/models/county.js');
var User = require('./app/models/user.js');

var port = process.env.port || 8080; // set our port

// ROUTES FOR OUR API
// ===========================
var router = express.Router(); // get an instance of the express router

// middleware to use for all requests
// router.use(function (req, res, next) {
	// do logging
	// console.log('Something is happening');
	// next(); // make sure we go to the next routes and don't stop here
// });

// test route to make sure everything's workin'
// router.get('/', function(req, res) {
	// res.json({ message: "cheers" });
// });

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

// on routes that end in /ads/:ad_id
// ---------------------------
router.route('/ads/:ad_id')

	// get the ad with that id (accessed at GET '/api/ads/:ad_id)
	.get(function (req, res) {
		
		// Use our Ad model to find the Ad we want
		Ad.findById(req.params.ad_id, function (err, ad) {
			if (err) { res.send(err); }
			
			res.json(ad);
		});
	})
	
	// update the ad with this id (accessed at PUT '/api/ads/:ad_id')
	.put(function (req, res) {
		
		// Use our Ad model to find the Ad we want
		Ad.findById(req.params.ad_id, function (err, ad) {
			if (err) { res.send(err); }
			
			// update the ads info
			ad.title = req.body.title;
			ad.price = req.body.price;
			ad.description = req.body.description;
			
			// save the ad
			ad.save(function (err) {
				if (err) { res.send(err); }
				
				res.json({ message: 'Ad updated' });
			});
		});
	})
	
	// delete the ad with this id (accessed at DELETE '/api/ads/:ad_id')
	.delete(function (req, res) {
		Ad.remove({
			_id: req.params.ad_id
		}, function (err, ad) {
			if (err) { res.send(err); }
			
			res.json({ message: 'Successfully deleted' });
		});
		
	});

// on routes that end in /cities
// ---------------------------	
router.route('/cities')
	.get(function (req, res) {
		City.find( function(err, cities) {
			if (err) { res.send(err); }
			
			if (cities.length === 0) {
				var seed = require('./app/helpers/seed');
				seed();
				City.find( function(err, cities) {
					if (err) { res.send(err); }
					res.json(cities);
				});	
			}
			
			res.json(cities);
		});
	});

// on routes that end in /counties
// ---------------------------
router.route('/counties')
	.get(function (req, res) {
		County.find( function(err, counties) {
			if (err) { res.send(err); }
			
			if (counties.length === 0) {
				var seed = require('./app/helpers/seed');
				seed();
				County.find( function(err, counties) {
					if (err) { res.send(err); }
					res.json(counties);
				});
			}
			
			res.json(counties);
		});
	});

// REGISTER OUR ROUTES -----------
// all of our routes will be prefixed with '/api'
app.use('/api', router);

// START THE SERVER
// ===========================
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

http.createServer(app).listen(app.get('port') ,app.get('ip'));

console.log('Magic happens on port ' + app.get('port'));





