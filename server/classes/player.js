var Cluster = require('./cluster');

function Player(options) {
    if (typeof options !== 'object') {
        warn('Player', 'options', options);
        options = {};
    }

    Cluster.call(this, options);

    this.initialize();
}

Player.prototype = Object.create(Cluster.prototype);
Player.prototype.constructor = Player;

Object.defineProperties(Player.prototype, {
    nick: {
        get: function() {
            return this.nick_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                logger.warn('Player#nick', 'val', val);
                val = 'goofy';
            }

            this.nick_ = val;
        }
    }
});

Player.prototype.initialize = function() {
    var generator = this.generator;

    this.id_ = generator.generateID();
    this.item_ = Heaven.generate(generator, 0);
}

module.exports = Player;

var logger = require('../engine/logger');
var Heaven = require('./heaven');
