var Root = require('./classes/root');

;
(function() {
    var root = new Root;

    root.setupDistribution({
        maxrate: 20
    });
})();

/*
// Updates items data
require('./executable/items');
// Distribution sends data to client on update
require('./executable/distribution');
// Creates asteroids
require('./executable/crop');

// Holders works on client's messages
require('./holders/player');
require('./holders/items');
require('./holders/heavens');
*/
