// BASE SETUP
// ============================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var path = require('path');
var multer  = require('multer');
var crypto = require('crypto');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure database
var mongoose = require('mongoose');

// configure statics
var userImageDest;
var adImageDest;

if (process.env.NODE_ENV === 'development') {
    mongoose.connect('mongodb://localhost/grabit');
    app.use('/public', express.static('public'));
    userImageDest = './public/users/';
    adImageDest = './public/ads/';
} else {
    mongoose.connect('mongodb://admin:4eH8pNKf31Kz@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':$OPENSHIFT_MONGODB_DB_PORT/grabit');
    app.use(process.env.OPENSHIFT_DATA_DIR, express.static(process.env.OPENSHIFT_DATA_DIR));
    userImageDest = process.env.OPENSHIFT_DATA_DIR + 'users';
    adImageDest = process.env.OPENSHIFT_DATA_DIR + 'ads';
}

// configure user image uploader
var userImageStorage = multer.diskStorage({
    destination: userImageDest,
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});
var userImageUpload = multer({ storage: userImageStorage}).single('image');

// configure ad image uploader
var adImageStorage = multer.diskStorage({
    destination: adImageDest,
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});
var adImageUpload = multer({ storage: adImageStorage}).single('image');

// importing models
var Ad = require('./app/models/ad.js');
var Category = require('./app/models/category.js');
var City = require('./app/models/city.js');
var County = require('./app/models/county.js');
var User = require('./app/models/user.js');

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
		var ad = new Ad(); // Create a new instance of the Ad modelad.title = req.body.title;ad.description = req.body.description;ad.price = req.body.price;ad.city.name = req.body.city;
		City.find({ 'name': req.body.city }, function(err, city) {
      console.log(city);
			ad.city.id = city[0]['_id'];
      ad.city.name = req.body.city;
			ad.user_id = mongoose.Types.ObjectId(req.body.user_id);
			ad.category.name = req.body.category;
      ad.price = req.body.price;
      ad.description = req.body.description;
      ad.title = req.body.title;

			Category.find({ 'name': ad.category.name }, function(err, category) {
				ad.category.id = category[0]['_id'];
				if (req.body.image !== undefined) {
					var data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
					var fileName = '';
					if (process.env.NODE_ENV === 'development') {
						fileName = 'public/' + ad.id + '.jpg';
					} else {
						fileName = process.env.OPENSHIFT_DATA_DIR + '/' + ad.id + '.jpg';
					}
					ad.image_url = fileName;
					fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
						if(err) { res.send(err); }
					});
				}

				// save the ad and check for errors
				ad.save(function (err) {
					if (err) { res.send(err); }

					res.json({ message: 'Ad created', id: ad._id });
				});
			});
		});
	})

	// get all the ads (accessed at GET '/api/ads')
	.get(function (req, res) {
		var query = Ad.find();

		if (req.param('user_id')) {
			query.where('user_id').equals(req.param('user_id'));
		} else {
			// searching in title and descripiton with free words
			var text = new RegExp(req.param('text'), 'i');
			query.find({ $or: [ { 'title': text }, { 'description': text } ] });

			// checking the city and category params, if exist bind it to our query
			if (req.param('city')) {
				query.where('city.name').equals(req.param('city'));
			}
			if (req.param('category')) {
				query.where('category.name').equals(req.param('category'));
			}

			if (req.param('gt') && req.param('lt') && (parseInt(req.param('lt')) !== 0)) {
				query.find({ 'price': { '$gt': req.param('gt'), '$lt': req.param('lt') }});
			}
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
		Ad.findById(mongoose.Types.ObjectId(req.params.ad_id), function (err, ad) {
      console.log('Ad found');
			if (err) { res.send(err); }

			if (String(ad.user_id) === req.body.user_id) {
				// update the ads info
				if (ad.title !== req.body.title) {
					ad.title = req.body.title;
				}
				if (ad.price !== req.body.price) {
					ad.price = req.body.price;
				}
				if (ad.description !== req.body.description) {
					ad.description = req.body.description;
				}

				// Update image
				if (req.body.image !== undefined) {
					var data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
					var fileName = '';
					if (process.env.NODE_ENV === 'development') {
						fileName = 'public/' + ad.id + '.jpg';
					} else {
						fileName = process.env.OPENSHIFT_DATA_DIR + '/' + ad.id + '.jpg';
					}
					ad.image_url = fileName;
					fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
						if(err) { res.send(err); }
					});
				}

				if (ad.city.name !== req.body.city) {
					City.find({ 'name': req.body.city }, function(err, city) {
						if (err) { res.send(err); }

						ad.city.id = city[0]['_id'];
						ad.city.name = req.body.city;

						ad.save(function (err) {
							if (err) { res.send(err); }

							res.json({ message: 'Ad updated' });
						});
					});
				} else {
					ad.save(function (err) {
						if (err) { res.send(err); }

						res.json({ message: 'Ad updated' });
					});
				}
			}
		});
	})

	// delete the ad with this id (accessed at DELETE '/api/ads/:ad_id')
	.delete(function (req, res) {
		Ad.remove({
			_id: req.params.ad_id
		}, function (err) {
			if (err) { res.send(err); }

			res.json({ message: 'Successfully deleted' });
		});

	});


  router.route('/ads/:ad_id/image')

    .post(function(req, res) {
      console.log(req.headers);
      Ad.findById(req.params.ad_id, function(err, ad) {
        if (err) { res.send(err); }

        if (ad !== null) {
          adImageUpload(req, res, function(err) {
            if (err) { res.send(err); }

            ad.image_url = req.file.filename;

            ad.save(function (err) {
              if (err) { res.send(err); }

              res.json({ message: 'Image uploaded' });
            });
          });
        } else {
          res.status(404).json({ message: 'Ad not found' });
        }
      });
    })

    .get(function (req, res) {
      Ad.findById(req.params.ad_id, function (err, ad) {
        if (err) { res.send(err); }

        if (ad !== null) {
          res.sendFile(ad.image_url, {
            root: adImageDest
          }, function (err) {
            if (err) { res.send(err); }
          });
        } else {
          res.status(404).json({ message: 'Ad not found' });
        }
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
		Category.find({ 'parent_id': { '$exists': false } }, function(err, categories) {
			if (err) { res.send(err); }

			res.json(categories);
		});
	});

// on routes that end in /categories/subcategories
// ----------------------------
router.route('/categories/subcategories')

	// get all subcategories (accessed at GET '/api/categories/subcategories')
	.get(function (req, res) {
		Category.find({ 'parent_id': { '$exists': true } }, function(err, categories) {
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
		}, function (err) {
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

			Category.find({ 'parent_id': category._id }, function(err, subcategories) {
				if (err) { res.send(err); }

				res.json(subcategories);
			});
		});
	});

// on routes that end in /cities
// ---------------------------
router.route('/cities')
	.get(function (req, res) {
		City.find().sort('name').exec(function(err, cities) {
			if (err) { res.send(err); }

			if (cities.length === 0) {
				var seed = require('./app/helpers/seed');
				seed();
				City.find().sort('name').exec(function(err, cities) {
					if (err) { res.send(err); }
					res.json(cities);
				});
			}

			res.json(cities);
		});
	});

// on routes that end in /cities/city_id
// ----------------------------
router.route('/cities/:city_id')
	.get(function (req, res) {
		City.find({ '_id': req.params.city_id }, function(err, city) {
			if (err) { res.send(err); }
			console.log(req.params.city_id);
			res.json(city[0]['name']);
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

// on routes that end in /users
// ---------------------------
router.route('/users')
	.post(function(req, res) {
		User.findById(req.body.user_id, function (err, u) {
			if (err) { res.send(err); }

			if (u === null) {
				var user = new User();
				user._id = req.body.user_id;

				user.save(function(err) {
					if (err) { res.send(err); }

					res.json({ message: 'User created' });
				});
			} else {
				res.json({ message: 'User already exists' });
			}
		});
	});

// on routes that end in /users/:user_id
// ------------------------------
router.route('/users/:user_id')

	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) { res.send(err); }

			if (user !== null) {
				res.json(user);
			} else {
				res.status(404).json({ message: 'User not found' });
			}
		});
	})

	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) { res.send(err); }

			if (user !== null) {
				user.name = req.body.name;
				user.email = req.body.email;
				user.phone = req.body.phone;

				user.save(function(err) {
					if (err) { res.send(err); }

					res.json({ message: 'User updated' });
				});
			} else {
				res.status(404).json({ message: 'User not found' });
			}
		});
	});

router.route('/users/:user_id/profile_picture')

	.post(function(req, res) {
    console.log(req.headers);
		User.findById(req.params.user_id, function(err, user) {
			if (err) { res.send(err); }

			if (user !== null) {
				userImageUpload(req, res, function(err) {
					if (err) { res.send(err); }

					user.image_url = req.file.filename;

					user.save(function (err) {
						if (err) { res.send(err); }

						res.json({ message: 'Image uploaded' });
					});
				});
			} else {
				res.status(404).json({ message: 'User not found' });
			}
		});
	})

	.get(function (req, res) {
		User.findById(req.params.user_id, function (err, user) {
			if (err) { res.send(err); }

			if (user !== null) {
				res.sendFile(user.image_url, {
					root: userImageDest
				}, function (err) {
					if (err) { res.send(err); }
				});
			} else {
				res.status(404).json({ message: 'User not found' });
			}
		});
	});

// REGISTER OUR ROUTES -----------
// all of our routes will be prefixed with '/api'
app.use('/api', router);

// START THE SERVER
// ===========================
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

http.createServer(app).listen(app.get('port') ,app.get('ip'));

console.log('Magic happens on port ' + app.get('port'));
