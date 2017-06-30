var Root = require('./classes/root');

;
(function() {
    var root = new Root;

    root.setupDistribution({
        maxrate: 20
    });
})();
