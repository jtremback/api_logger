//Get mtgox api
//Get topmost id
//save to disk
//Get api stored id onwards
//repeat
var http = require("http"),
  fs = require('fs'),
  spawn = require('child_process').spawn;

var config = {
  "host": "data.mtgox.com",
  "path": "/api/1/BTCUSD/depth/fetch",
  "out_dir": "../api_logger_extrepo/"
}



var logSnap = function(config) {

  var options = {
    host: config.host,
    headers: {'user-agent': 'Mozilla/5.0'},
    path: config.path
  };

  http.get(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      chunkWrangler.add(chunk);
    })
    .on('end', function() {
      chunkWrangler.end(config);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};



var committer = function(config) {
  var stamp = (new Date()).getTime(),
  add = spawn('git', ["add", "."], {cwd: config.out_dir}),
  commit = spawn('git', ["commit", '-m', stamp], {cwd: config.out_dir});

  add.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  add.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });

  commit.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  commit.on('close', function (code) {
    console.log('child process exited with code ' + code);
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
    end: function(config) {
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

        fs.appendFile(config.out_dir + 'log.txt', newlined, function (err) {
          if (err) throw err;
          console.log('The "data to append" was appended to file!');

          //commit to repo
          committer(config);
        });
      } else {
        console.log("something wrong with api");
      }
    }
  }
}();



logSnap(config);
