var Root = require('./classes/root');

;
(function() {
    var root = new Root;

    root.setupDistribution({
        maxrate: 20
    });

    root.setupSpawner({
        count: 3,
        interval: 3000,
        lifetime: 10000
    })
})();
