const Item = require('../engine/item');

function Heaven(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Heaven', 'options', options);
        options = {};
    }

    Item.call(this, options);

    this.initialize(options);
}

Heaven.prototype = Object.create(Item.prototype);
Heaven.prototype.constructor = Heaven;

Object.defineProperties(Heaven.prototype, {});

Heaven.prototype.feed = function(item) {
    var substances = item.physic.matter.substances.toObject();

    this.physic.matter.addSubstances(substances);
}

Heaven.prototype.initialize = function(options = {}) {
    // Install sphere collider for heaven
    this.collider.sphere();

    var self = this;
    this.attachEvent('update', options => {
        var time = options.time;
    });

    this.initializePhysic(options.physic);
    this.initializeRigidbody(options.rigidbody);
}

Heaven.prototype.initializePhysic = function(physic) {
    if (physic instanceof Physic) {
        this.physic = physic;
    } else {
        this.physic = new Physic({
            matter: new Matter({
                Fe: 0
            })
        });
    }
}

Heaven.prototype.initializeRigidbody = function(rigidbody) {
    if (rigidbody instanceof Rigidbody) {
        this.rigidbody = rigidbody;
    } else {
        rigidbody = new Rigidbody;
        this.rigidbody = rigidbody;
    }

    this.rigidbody.body = this.body;
    this.rigidbody.physic = this.physic;
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

function rotationChange(item, value, time) {
    var newvel = new Vec3(value[0], value[1], value[2]);
    if (newvel.length() > 1) {
        return;
    }

    var maxAngle = time / 1000 * item.physic.rotationSpeed;

    var oldvel = item.rigidbody.velocity;

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
var Body = require('../engine/body');
var Physic = require('../engine/physic');
var Matter = require('../engine/matter');
var Rigidbody = require('../engine/rigidbody');
var Collider = require('../engine/collider');
var Generator = require('./generator');
var math = require('../engine/math');
var amc = math.amc;