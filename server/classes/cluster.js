function Cluster(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Cluster', 'options', options);
        options = {};
    }

    this.generator = options.generator;

    this.initialize();
}

Object.defineProperties(Cluster.prototype, {
    generator: {
        get: function() {
            return this.generator_;
        },
        set: function(val) {
            if (!(val instanceof Generator)) {
                logger.warn('Cluster#generator', 'val', val);
                val = new Generator;
            }

            this.generator_ = val;
        }
    },
    id: {
        get: function() {
            return this.id_;
        }
    },
    item: {
        get: function() {
            return this.item_;
        }
    }
});

Cluster.prototype.isReady = function() {
    return !!(typeof this.id === 'number' && this.item);
}

Cluster.prototype.remove = function() {

}

Cluster.prototype.toJSON = function() {
    var out = {};

    out.id = this.id || -1;
    out.nick = this.nick || '';

    if (this.item) {
        out.item = this.item.toJSON();
    }

    return out;
}

module.exports = Cluster;

var logger = require('../engine/logger');
var Heaven = require('./heaven');
var Generator = require('./generator');
