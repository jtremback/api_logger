var fs = require('fs'),
  spawn = require('child_process').spawn,
  config = require('./config.json');

var init = (function() {
	fs.exists(config.out_dir, function(exists) {
		if (!exists) {
			fs.mkdir(config.out_dir, function() {
				init = spawn('git', ['init'], {cwd: config.out_dir});
				console.log("Made output directory according to config, started git repo in it.")
			})
		} else {
			console.log("There is already a directory here.");
		}
	});
}());
