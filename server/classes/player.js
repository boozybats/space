function Player(id) {
    this.id = id;

    this.item = new Heaven;
}

Object.defineProperties(Player.prototype, {
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Player#id', 'val', val);
                val = -1;
            }

            this.id_ = val;
        }
    },
    item: {
        get: function() {
            return this.item_;
        },
        set: function(val) {
            if (!(val instanceof Heaven)) {
                logger.warn('Player#item', 'val', val);
                val = new Heaven;
            }

            this.item_ = val;
        }
    },
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

Player.prototype.isReady = function() {
    return !!(this.id && this.item);
}

Player.prototype.toJSON = function() {
    var out = {};

    out.id = this.id || -1;
    out.nick = this.nick || '';

    if (this.item) {
        out.item = this.item.toJSON();
    }

    return out;
}

module.exports = Player;

var logger = require('../engine/logger');
var Heaven = require('./heaven');
