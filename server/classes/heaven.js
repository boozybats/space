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

    var volume = generator.getVolume(level);
    heaven.physic.matter = new Matter({
        Fe: volume
    });

    var vec = generator.getPosition(level);
    heaven.body.position = vec;

    return heaven;
}

Heaven.prototype.setChanges = function(arr) {
}

module.exports = Heaven;

var logger = require('../engine/logger');
var Physic = require('../engine/physic');
var Matter = require('../engine/matter');
var Rigidbody = require('../engine/rigidbody');
var Generator = require('./generator');
