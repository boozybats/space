function Player(generator) {
    if (!(generator instanceof Generator)) {
        logger.warn('Player', 'generator', generator);
        generator = new Generator;
    }

    this.generator = generator;

    this.initialize();
}

Object.defineProperties(Player.prototype, {
    generator: {
        get: function() {
            return this.generator_;
        },
        set: function(val) {
            if (!(val instanceof Generator)) {
                logger.warn('Player#generator', 'val', val);
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

Player.prototype.initialize = function() {
    var generator = this.generator;

    this.id_ = generator.generateID();
    this.item_ = Heaven.generate(generator, 0);
}

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
var Generator = require('./generator');
