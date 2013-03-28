//Get mtgox api
//Get topmost id
//save to disk
//Get api stored id onwards
//repeat
var balUtil = require('bal-util'),
  http = require("http"),
  fs = require('fs'),
  spawn = require('child_process').spawn;


//Get the depth and log it
//Trim and save them
var logSnap = function(path) {

  var options = {
    host: 'data.mtgox.com',
    headers: {'user-agent': 'Mozilla/5.0'},
    path: path
  };

  http.get(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      chunkWrangler.add(chunk);
    })
    .on('end', function() {
      chunkWrangler.end();
    });
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

    //Turn into real object
    end: function() {
      var json = JSON.parse(wholethang);

      //Verify, summarize and append
      var summarizer = function(depthArrayName, json) {
        console.log(depthArrayName);
        //Get only the properties needed
        var summLogic = function(input) {
          return {
            stamp: input.stamp,
            price: input.price,
            amount: input.amount
          }
        };
        var depthArray = json.return[depthArrayName];
        return depthArray.map(summLogic);
      }

      //Turn back into string and append
      if (json.result === "success") {
        var newObj = {}
        newObj.asks = summarizer("asks", json);
        newObj.bids = summarizer("bids", json);

        var summarized = JSON.stringify(newObj),
          newlined = summarized.replace(/,/g, ',\n');

        fs.appendFile('log.txt', newlined, function (err) {
          if (err) throw err;
          console.log('The "data to append" was appended to file!');

        });
      } else {
        console.log("something wrong with api");
      }
    }
  }
}();

logSnap("/api/1/BTCUSD/depth/fetch");
