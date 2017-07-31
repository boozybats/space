var Cluster = require('./cluster');

function NPC(options) {
    if (typeof options !== 'object') {
        warn('NPC', 'options', options);
        options = {};
    }

    this.instanceTime = options.instanceTime;
    this.level = options.level;

    Cluster.call(this, options);

    this.initialize();
}

NPC.prototype = Object.create(Cluster.prototype);
NPC.prototype.constructor = NPC;

Object.defineProperties(NPC.prototype, {
    instanceTime: {
        get: function() {
            return this.instanceTime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('NPC#instanceTime', 'val', val);
                val = 0;
            }

            this.instanceTime_ = val;
        }
    },
    level: {
        get: function() {
            return this.level_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('NPC#level', 'val', val);
                val = 0;
            }

            this.level_ = val;
        }
    }
});

NPC.prototype.initialize = function() {
    var generator = this.generator;

    this.id = generator.generateID();
    this.item = Heaven.generateNPC(this.generator, this.level);
}

module.exports = NPC;

var logger = require('../engine/logger');
var Heaven = require('./heaven');
