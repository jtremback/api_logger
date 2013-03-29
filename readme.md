Mt. Gox depth logger
====================

This logger fetches the mtgox market depth api and throws out some unnecessary
data, then writes it to a file and stores it in a git repo. The use of git 
should allow us to save on disk space, especially when logging often.

To use this logger, first run `node bootstrap.js`. This will set up a folder 
and initialize a git repo in it. Then run `node logger.js` this will log 
according to some settings in config.json.
