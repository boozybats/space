function Player(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Player', 'options', options);
        options = {};
    }

    Cluster.call(this, options);
}

module.exports = Player;

var Cluster = require('./cluster');

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
                val = 'Kepler';
            }

            this.nick_ = val;
        }
    }
});

var logger = require('../engine/logger');
var Heaven = require('./heaven');