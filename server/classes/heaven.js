const Item = require('../engine/item');

function Heaven(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Heaven', 'options', options);
        options = {};
    }

    options.physic = new Physic;

    Item.call(this, options);

    this.rigidbody = new Rigidbody({
        body: this.body
    });
}

Heaven.prototype = Object.create(Item.prototype);
Heaven.prototype.constructor = Heaven;

Object.defineProperties(Heaven.prototype, {
    instanceTime: {
        get: function() {
            return this.instanceTime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Heaven#instanceTime', 'val', val);
                val = 0;
            }

            this.instanceTime_ = val;
        }
    }
});

Heaven.generate = function(generator, level = 0) {
    if (!(generator instanceof Generator)) {
        logger.warn('Heaven->generate', 'generator', generator);
        generator = new Generator;
    }
    if (typeof level !== 'number') {
        logger.warn('Heaven->generate', 'level', level);
        level = 0;
    }

    var heaven = new Heaven;

    var volume = generator.getVolume({
        level: level
    });
    heaven.physic.matter = new Matter({
        Fe: volume
    });

    var vec = generator.getPosition({
        level: level
    });
    heaven.body.position = vec;

    return heaven;
}

Heaven.generateNPC = function(generator, level = 0) {
    if (!(generator instanceof Generator)) {
        logger.warn('Heaven->generateNPC', 'generator', generator);
        generator = new Generator;
    }
    if (typeof level !== 'number') {
        logger.warn('Heaven->generateNPC', 'level', level);
        level = 0;
    }

    var heaven = new Heaven;

    var volume = generator.getVolume({
        level: level,
        npc: true
    });
    heaven.physic.matter = new Matter({
        Fe: volume
    });

    var vec = generator.getPosition({
        level: level,
        npc: true
    });
    heaven.body.position = vec;

    return heaven;
}

Heaven.prototype.setChanges = function(properties, time) {
    if (typeof properties !== 'object') {
        logger.warn('Heaven#setChanges', 'properties', properties);
        return;
    }

    for (var i in properties) {
        if (!properties.hasOwnProperty(i)) {
            continue;
        }

        this.setChange(i, properties[i], time);
    }
}

Heaven.prototype.setChange = function(type, value, time) {
    switch (type) {
        case 'velocity':
            if (value instanceof Array && value.length == 3) {
                rotationChange(this, value, time);
            }

            break;
    }
}

function rotationChange(item, value, time) {
    var maxAngle = time / 1000 * item.physic.rotationSpeed;

    var oldvel = item.rigidbody.velocity;
    var newvel = new Vec3(value[0], value[1], value[2]);

    var angle = Vec.angle(oldvel, newvel);
    
    if (angle > maxAngle) {
        return;
    }

    item.rigidbody.velocity = newvel;
}

module.exports = Heaven;

var logger = require('../engine/logger');
var v = require('../engine/vector');
var Vec = v.Vec;
var Vec3 = v.Vec3;
var Physic = require('../engine/physic');
var Matter = require('../engine/matter');
var Rigidbody = require('../engine/rigidbody');
var Generator = require('./generator');
