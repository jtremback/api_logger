var http = require('http'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  config = require('./config.json');



var download = function() {

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
      console.log("Data downloaded.");
      chunkWrangler.end(config);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};



var committer = function() {
  //generate timestamp
  var stamp = (new Date()).getTime(),
  //git add
  add = spawn('git', ['add', '.'], {cwd: config.out_dir});
  //when add ends, 
  add.on('close', function (code) {
    commit = spawn('git', ['commit', '-m', '"' + stamp + '"'], {cwd: config.out_dir});
    commit.on('close', function (code) {
      if (code === 0) {
        console.log("Commit");
      } else {
        console.log("No commit");
      }
      setTimeout(download, config.interval);
    });
  });
};



var summarizer = function(depthArrayName, json) {
  console.log('Trimming "' + depthArrayName + '"');

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
};



var filePacker = function(json) {
  //summarize and compile to new obj
  var newObj = {}
  newObj.asks = summarizer("asks", json);
  newObj.bids = summarizer("bids", json);

  //Turn back into string, add newlines
  var summarized = JSON.stringify(newObj),
    newlined = summarized.replace(/,/g, ',\n');

  //write
  fs.writeFile(config.out_dir + 'log.json', newlined, function (err) {
    if (err) throw err;
    console.log('Data written to file!');

    //commit to repo
    committer(config);
  });
};



//Assemble, process and append
var chunkWrangler = (function() {
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
      filePacker(json);
      wholethang = false;
    }
  }
})();

download();

