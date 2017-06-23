const Item = require('../engine/item');

function Heaven(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Heaven', 'options', options);
        options = {};
    }

    Item.call(this, options);
}

Heaven.prototype = Object.create(Item.prototype);
Heaven.prototype.constructor = Heaven;

module.exports = Heaven;

var logger = require('../engine/logger');
