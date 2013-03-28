//Get mtgox api
//Get topmost id
//save to disk
//Get api stored id onwards
//repeat


var http = require("http");
var fs = require('fs');


// //Get mtgox api
// //Get topmost id
// //save to disk
// //Get api stored id onwards
// //repeat

// var options = {
//   host: 'data.mtgox.com',
//   headers: {'user-agent': 'Mozilla/5.0'},
//   path: '/api/1/BTCUSD/trades?raw'
// };

// http.get(options, function(res) {
// 	res.setEncoding('utf8');
// 	res.on('data', function(chunk){
// 		chunkWrangler.add(chunk);
// 	})
// 	.on('end', function(){
// 		chunkWrangler.end();
// 	})
// }).on('error', function(e) {
//   console.log("Got error: " + e.message);
// });

// //make persistant container var
// //if it is empty, set to chunk
// //if it is fullsome, concatenate chunk on to it

// var chunkWrangler = function() {
// 	var wholethang = false;

// 	return {
// 		add: function(chunk) {
// 			if (wholethang) {
// 				wholethang += chunk;
// 			} else {
// 				wholethang = chunk;
// 			}
// 		},

// 		end: function() {
// 			var jason = JSON.parse(wholethang);
// 			console.log(jason[1].tid);
// 			wholethang = false;
// 		}
// 	}
// }();


//Get the transactions since the last id
//Trim and save them
var logCycle = function(lasttid) {

	//In case its the first time round 
	if (lasttid) { 
		var path = '/api/1/BTCUSD/trades?since=' + lasttid
	} else {
		path = '/api/1/BTCUSD/trades?raw'
	}

	var options = {
	  host: 'data.mtgox.com',
	  headers: {'user-agent': 'Mozilla/5.0'},
	  path: path
	};

	http.get(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			chunkWrangler.add(chunk);
		})
		.on('end', function(){
			chunkWrangler.end();
		})
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
};

//Assemble, process and append
var chunkWrangler = function() {
	var wholethang = false;

	return {

		//Assemble chunks into large string encoded object
		add: function(chunk) {
			if (wholethang) {
				wholethang += chunk;
			} else {
				wholethang = chunk;
			}
		},

		//Turn into real object, process and append
		end: function() {
			var jason = JSON.parse(wholethang),
				firstTid = jason[1].tid;

			//Get only the properties needed
			var summarizer = function(input) {
				return {
					tid: input.tid,
					price: input.price,
					amount: input.amount,
					trade_type: input.trade_type
				}
			}

			//Turn back into string and append
			var summarized = JSON.stringify(jason.map(summarizer)),
				trimmed = summarized.slice(1, -1);

			
			fs.appendFile('logg.txt', trimmed, function (err) {
				if (err) throw err;
				console.log('The "data to append" was appended to file!');
				setTimeout(logCycle(firstTid), 1000);
			});
			
			console.log(firstTid);

		}
	}

}();

logCycle(0);
