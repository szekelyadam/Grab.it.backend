var xlsx = require('node-xlsx');
var County = require('../models/county.js');
var City = require('../models/city.js');

var seedLocations = function () {
	var hunXlsx = xlsx.parse('xlsx/hungary.xlsx');
		
	// iterating through the rows of the xlsx
	hunXlsx[0].data.forEach(function(element) {
		// check if city already exists
		City.findById(element[0], function(err, ci) {
			if (err) { return err; }
			
			// there isn't a city with the given id
			if (ci === null) {
				// Setting up a new city
				var city = new City();
		
				city._id = element[0];
				city.zip = element[1];
				city.county_id = element[2];
				city.name = element[4];
				
				// Check if the county exists
				County.findById(element[2], function(err, county) {
					if (err) { return err; }
					
					// County exists, we only have to save our city
					if (county !== null) {
						city.save(function(err) {
							if (err) { return err; }
						});
					} else { // There's no such county, create that too
						var co = new County();
						
						co._id = element[2];
						co.name = element[3];
						
						co.save(function(err) {
							if (err) { return err; }
							
							city.save(function(err) {
								if (err) { return err; }
							});
						});
					}
				});	
			}
		});	
	}, this);
};

module.exports = seedLocations;