//Get mtgox api
//Get topmost id
//save to disk
//Get api stored id onwards
//repeat


var http = require("http");


//Get mtgox api
//Get topmost id
//save to disk
//Get api stored id onwards
//repeat

var options = {
  host: 'data.mtgox.com',
  headers: {'user-agent': 'Mozilla/5.0'},
  path: '/api/1/BTCUSD/trades?raw'
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

//make persistant container var
//if it is empty, set to chunk
//if it is fullsome, concatenate chunk on to it

var chunkWrangler = function() {
	var wholethang = false;

	return {
		add: function(chunk) {
			if (wholethang) {
				wholethang += chunk;
			} else {
				wholethang = chunk;
			}
		},

		end: function() {
			var jason = JSON.parse(wholethang);
			console.log(jason[1].tid);
			wholethang = false;
		}
	}
}();

