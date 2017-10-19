function NPC(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('NPC', 'options', options);
        options = {};
    }

    this.instanceTime = options.instanceTime;

    Cluster.call(this, options);
}

module.exports = NPC;

var Cluster = require('./cluster');

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
    }
});

var logger = require('../engine/logger');
var Heaven = require('./heaven');