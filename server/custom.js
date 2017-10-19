var Root = require('./classes/root');

;
(function() {
    var root = new Root;

    root.setupSpawner();

    root.setupDistribution({
        maxrate: 20
    });
})();
