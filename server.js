// BASE SETUP
// ============================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

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
var Image = require('./app/models/image.js');
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
		ad.description = req.body.description;
		ad.price = req.body.price;
		ad.city_id = req.body.city_id;
		ad.user_id = mongoose.Types.ObjectId(req.body.user_id);
		ad.category_id = mongoose.Types.ObjectId(req.body.category_id);

		if (req.body.image !== null) {
			var data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
			var fileName = 'public/'  + ad.id + '.jpg';
			fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
  			if(err) { res.send(err); }
			});
		}

		// save the ad and check for errors
		ad.save(function (err) {
			if (err) { res.send(err); }

			res.json({ message: 'Ad created' });
		});

	})

	// get all the ads (accessed at GET '/api/ads')
	.get(function (req, res) {
		var query = Ad.find();

		// searching in title and descripiton with free words
		var title = new RegExp(req.param('title'), 'i');
		var desc = new RegExp(req.param('description'), 'i');
		query.find({ "title": title });
		query.or({ "description": desc });

		// checking the city and category params, if exist bind it to our query
		if (req.param('city_id')) {
			query.where('city_id').equals(req.param('city_id'));
		}
		if (req.param('category_id')) {
			query.where('category_id').equals(req.param('category_id'));
		}
		if (req.param('gt') && req.param('lt')) {
			query.find({ 'price': { '$gt': req.param('gt'), '$lt': req.param('lt') }});
		}

		// execute query
		query.exec( function(err, ads) {
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

			ad.images = [];

			if (req.body.images !== null) {
				req.body.images.forEach(function(imageContent) {
					var image = new Image();
					image.image = imageContent;
					ad.images.push(image);
				}, this);
			}

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


// on routes that end in /categories
// ---------------------------
router.route('/categories')

	// create a category (accessed at POST '/api/categories')
	.post(function (req, res) {

		Category.findOne({ 'name': req.body.name }, function (err, cat) {
			console.log(cat !== null);
			if (cat !== null) {
				res.json({ message: 'Category already exists' });
			} else {
				var category = new Category(); // Create a new instance of the Category model
				category.name = req.body.name;

				if (req.body.parent_id !== undefined) {
					category.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
				}

				category.icon = req.body.icon;

				// save the category and check for errors
				category.save(function (err) {
					if (err) { res.send(err); }

					res.json({ message: 'Category created' });
				});
			}
		});

	})

	// get all the ads (accessed at GET '/api/categories')
	.get(function (req, res) {
		Category.find({ "parent_id": { "$exists": false } }, function(err, categories) {
			if (err) { res.send(err); }

			res.json(categories);
		});
	});

// on routes that end in /categories/:category_id
// ---------------------------
router.route('/categories/:category_id')

	// get the category with that id (accessed at GET '/api/categories/:category_id)
	.get(function (req, res) {

		// Use our Category model to find the Category we want
		Category.findById(req.params.category_id, function (err, category) {
			if (err) { res.send(err); }

			res.json(category);
		});
	})

	// delete the category with this id (accessed at DELETE '/api/categories/:category_id')
	.delete(function (req, res) {
		Category.remove({
			_id: req.params.category_id
		}, function (err, category) {
			if (err) { res.send(err); }

			res.json({ message: 'Successfully deleted' });
		});

	});

// on routes that end in /categories/:category_id/subcategories
router.route('/categories/:category_id/subcategories')

	// get the category's subcategories
	.get(function (req, res) {

		Category.findById(req.params.category_id, function(err, category) {
			if (err) { res.send(err); }

			Category.find({ "parent_id": category._id }, function(err, subcategories) {
				if (err) { res.send(err); }

				res.json(subcategories);
			});
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
