function Phys() {}

/**
 * Returns gravity power between 2 bodies.
 * @param {number} m0 Mass of first object
 * @param {number} m1 Mass of second object
 * @param {number} l Length (radius) between objects
 * @return {number} F
 */
Phys.gravity = function(m0, m1, l) {
    if (typeof m0 !== 'number') {
        warn('Phys#gravity', 'm0', m0);
    }
    if (typeof m1 !== 'number') {
        warn('Phys#gravity', 'm1', m1);
    }
    if (typeof l !== 'number') {
        warn('Phys#gravity', 'l', l);
    }

    return G * ((m0 + m1) / Math.pow(l, 2));
}

/**
 * Returns layer height which volume starts on "V1"
 * and ends on "V0". "V1" isn't end volume because it
 * can be not selected.
 * @param {number} V0 End volume
 * @param {number} V1 Start volume
 * @return {number} R
 */
Phys.layerHeight = function(V0, V1 = 0) {
    if (typeof V0 !== 'number') {
        warn('Phys#layerHeight', 'V0', V0);
    }
    if (typeof V1 !== 'number') {
        warn('Phys#layerHeight', 'V1', V1);
    }

    var V = V0 + V1;
    var R = Math.pow(V / (4 / 3 * Math.PI), 1 / 3);
    var R1 = Math.pow(V1 / (4 / 3 * Math.PI), 1 / 3);
    var out = R - R1;

    return out;
}

Phys.layerVolume = function(h, R = 0) {
    if (typeof h !== 'number') {
        warn('Phys#layerHeight', 'h', h);
    }
    if (typeof R !== 'number') {
        warn('Phys#layerHeight', 'R', R);
    }

    var l = R + h;
    var V = 4 / 3 * Math.PI * Math.pow(l, 3);
    var V1 = 4 / 3 * Math.PI * Math.pow(R, 3);
    var out = V - V1;

    return out;
}

/**
 * Defines decreasing or increasing function sended.
 * @param {Function} func Check function
 * @param {number} to End value to send as parameter
 * @param {number} precision How much times check the function
 * @return {string|number} 0 | +inf | -inf
 */
Phys.infLim = function(func, to = 9999999, precision = 100) {
    var x0 = 0,
        x1 = to;
    var interval = (x1 - x0) / precision;

    var position = 0;
    var last;
    for (var i = x0; Math.abs(i) < Math.abs(x1); i += interval) {
        var res = func.call(this, i);
        if (last) {
            res > last ? position++ : position--;
        }
        last = res;
    }

    if (position > 1) {
        return 1;
    } else if (position < -1) {
        return -1;
    } else {
        return 0;
    }
}

Phys.mass = function(p, V) {
    if (typeof p !== 'number') {
        warn('Phys#mass', 'v', p);
    }
    if (typeof V !== 'number') {
        warn('Phys#mass', 'V', V);
    }

    return p * V;
}

/**
 * Physic of object, generates diameter, pressure, temperature
 * and e.t.c by matter. Contains info about velocity, acceleration,
 * gravity power, etc.
 * Physic must have a matter because all parameters calculated relative
 * on this.
 *
 * D - diameter
 * F - force
 * h - height
 * l - distance
 * M - molar mass
 * m - mass
 * p - density
 * P - pascal
 * R - radius
 * V - volume
 *
 * @constructor
 * @this {Physic}
 * @param {Matter} matter
 */
function Physic(matter = new Matter) {
    this.matter = matter;

    this.onupdate = function() {};
}

Object.defineProperties(Physic.prototype, {
    color: {
        get: function() {
            return this.matter.color;
        }
    },
    diameter: {
        get: function() {
            return this.matter.diameter;
        }
    },
    mass: {
        get: function() {
            return this.matter.mass;
        }
    },
    matter: {
        get: function() {
            return this.matter_;
        },
        set: function(val) {
            if (!(val instanceof Matter)) {
                warn('Physic#matter', 'val', val);
                val = new Matter;
            }

            this.matter_ = val;
        }
    },
    maxspeed: {
        get: function() {
            // In second
            return this.matter.maxspeed;
        }
    },
    onupdate: {
        get: function() {
            return this.onupdate_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                warn('Physic#onupdate', 'val', val);
                val = function() {};
            }

            this.onupdate_ = val;
        }
    },
    volume: {
        get: function() {
            return this.matter.volume;
        }
    }
});

Physic.prototype.Density = function(R) {
    if (typeof R !== 'number') {
        warn('Physic#Density', 'R', R);
        R = 0;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        if (radius >= R) {
            out = layer.density;

            return false;
        }
    });

    return out;
}

Physic.prototype.Mass = function(R) {
    if (typeof R !== 'number') {
        warn('Physic#Mass', 'R', R);
        R = 0;
    }

    var out = 0;

    var self = this;
    this.matter.each((layer, radius) => {
        if (radius >= R) {
            var m0 = (radius - R) / layer.height * layer.mass;
            var sibling = self.matter.nextSibling(layer);
            var m1 = (sibling.height - sibling.radius + R) / sibling.height * sibling.mass;
            out = m0 + m1;

            return false;
        }
    });

    return out;
}

Physic.prototype.MassTotal = function(R = Infinity) {
    if (typeof R !== 'number') {
        warn('Physic#MassTotal', 'R', R);
        R = Infinity;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        if (radius >= R) {
            var approx = (R - layer.radius) / layer.height * layer.mass;
            out += approx;

            return false;
        } else {
            out += layer.mass;
        }
    });

    return out;
}

Physic.prototype.Pressure = function(R) {
    if (typeof R !== 'number') {
        warn('Physic#Pressure', 'R', R);
        R = 0;
    }

    var out = 0;

    var self = this;
    this.matter.each((layer, radius) => {
        if (radius >= R) {
            out = G * (self.MassTotal(R) * self.Density(R) / Math.pow(R, 2));

            return false;
        }
    });

    return out;
}

Physic.prototype.Temperature = function(R) {
    if (typeof R !== 'number') {
        warn('Physic#Temperature', 'R', R);
        R = 0;
    }

    return this.Pressure(R) * this.VolumeTotal(R) / PRESSURE_TEMPERATURE_CONST;
}

Physic.prototype.toJSON = function() {
    var out = {};

    out.matter = this.matter.toJSON();

    return out;
}

Physic.prototype.VolumeTotal = function(R = Infinity) {
    if (typeof R !== 'number') {
        warn('Physic#VolumeTotal', 'R', R);
        R = Infinity;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        out += layer.volume;
        if (radius >= R) {
            return false;
        }
    });

    return out;
}

/**
 * Matter creates layers by substances added or removed from it.
 * @constructor
 */
function Matter(substances = {}) {
    this.volume_ = 0;
    this.layers_ = [];

    // Is this matter empty
    this.empty_ = true;

    var subs = new Storage;
    subs.filter = (data => typeof data === 'number');
    this.substances = subs;

    this.addSubstances(substances);
}

Object.defineProperties(Matter.prototype, {
    color: {
        get: function() {
            return this.color_;
        }
    },
    diameter: {
        get: function() {
            return this.diameter_;
        }
    },
    empty: {
        get: function() {
            return this.empty_;
        }
    },
    layers: {
        get: function() {
            return this.layers_;
        }
    },
    lastLayer: {
        get: function() {
            return this.layers[this.layers.length - 1];
        }
    },
    mass: {
        get: function() {
            return this.mass_;
        }
    },
    maxspeed: {
        get: function() {
            return this.maxspeed_;
        }
    },
    radius: {
        get: function() {
            return this.radius_;
        }
    },
    volume: {
        get: function() {
            return this.volume_;
        }
    }
});

/**
 * Add a single substance to matter by name and volume. Usualy are called
 * by "addSubstances".
 * @param {String} name
 * @param {Number} volume
 */
Matter.prototype.addSubstance = function(name, volume) {
    if (typeof volume !== 'number') {
        warn('Matter#addSubstance', 'volume', volume);
        volume = 0;
    }

    var periodic = PeriodicTable[name];
    if (!periodic) {
        return false;
    }

    this.empty_ = false;

    this.volume_ += volume;

    var o_volume = this.substances.get(name);
    if (typeof o_volume === 'undefined') {
        this.substances.set(name, volume);
    } else {
        this.substances.set(name, o_volume + volume);
    }

    return true;
}

/**
 * Adds substances to matter and then calls "updateLayers".
 * @param {Object} substances
 */
Matter.prototype.addSubstances = function(substances) {
    if (typeof substances !== 'object') {
        warn('Matter#addSubstances', 'substances', substances);
        substances = {};
    }

    for (var i in substances) {
        if (substances.hasOwnProperty(i)) {
            this.addSubstance(i, substances[i]);
        }
    }

    this.updateLayers();
    this.defineParameters();
}

/**
 * Sets important parameters.
 */
Matter.prototype.defineParameters = function() {
    var last = this.lastLayer;

    if (last) {
        var substance = last.substances[last.substances.length - 1];
        this.color_ = PeriodicTable[substance].color;
    } else {
        this.color_ = undefined;
    }

    this.radius_ = Math.pow(3 * this.volume / (4 * Math.PI), 1 / 3);
    this.diameter_ = this.radius * 2;
    this.maxspeed_ = this.diameter * 0.4;
}

/**
 * Goes through all layers and sends to callback a layer and layer's radius,
 * if callback returns false then stops cycling.
 * @param  {Function} callback
 */
Matter.prototype.each = function(callback) {
    if (typeof callback !== 'function') {
        warn('Matter#each', 'callback', callback);
        return;
    }

    var layers = this.layers;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];

        var radius = layer.radius + layer.height;
        var result = callback(layer, radius);

        if (result === false) {
            break;
        }
    }
}

/**
 * Returns sorted array of substances by density in decreasing order.
 * @return {Array}
 */
Matter.prototype.getSortedSubstances = function() {
    var out = [];

    var substances = this.substances;
    substances.each((volume, name) => {
        var item = {
            name: name,
            volume: volume
        };

        out.push(item);
    });

    out.sort(function(a, b) {
        if (PeriodicTable[a.name].p < PeriodicTable[b.name].p) {
            return 1;
        } else {
            return -1;
        }
    });

    return out;
}

/**
 * How much height will be a one layer if layers count must be
 * "lAYERS_COUNT" for matter's volume.
 * @return {Number}
 */
Matter.prototype.layerHeight = function() {
    var R = Phys.layerHeight(this.volume);
    var out = R / LAYERS_COUNT;

    return out;
}

/**
 * Returns next layer.
 * @param  {Object} layer
 * @return {Object}
 */
Matter.prototype.nextSibling = function(layer) {
    if (!layer) {
        warn('Matter#nextSibling', 'layer', layer);
        return layer;
    }

    var out;
    var radius = layer.radius;

    var layers = this.layers_;
    var isNext = false;
    for (var layer of layers) {
        if (isNext) {
            out = layer;
            break;
        } else if (layer.radius == radius) {
            isNext = true;
        }
    }

    return out;
}

Matter.prototype.toJSON = function() {
    return this.substances.toObject();
}

/**
 * Sets layers by substances added or removed from matter.
 * @method
 */
Matter.prototype.updateLayers = function() {
    var layers = [];
    var height = this.layerHeight();
    var substances = this.getSortedSubstances();

    // Sum all masses and define to matter
    var all_mass = 0;

    var self = this;;
    (function core(R = 0, index = 0) {
        var substance = substances[index];
        if (!substance) {
            return;
        }

        // Current substance volume and density
        var Vs = substance.volume;
        var p = PeriodicTable[substance.name].p;

        // Last instantiated layer from all layers
        var last = layers[layers.length - 1];
        var residue;

        /* If last layer haven't filled fully or layer doesn't exist
        than fill it with new substance */
        if (last && last.maxVolume > last.volume) {
            // Unfilled volume of layer
            var Vr = last.maxVolume - last.volume;

            // How much substance will remain if fill layer
            residue = Vs - Vr;

            /* Layer volume after filling it with substance, if residue
            bigger than 0 then layer's volume takes maximum value. */
            var V = residue >= 0 ? Vr : Vr + residue;

            // Add new substance to layer's matter
            last.substances.push(substance.name);

            // Average density of layer
            var avgP = 0;
            var subs = last.substances;
            for (var i = 0; i < subs.length; i++) {
                avgP += PeriodicTable(subs[i]).p;
            }
            avgP /= subs.length;
            last.density = avgP;

            // Add volume and mass to last layer
            last.volume += V;
            var mass = Phys.mass(p, Vs);
            last.mass += mass;
            all_mass += mass;
        }
        // If layers count is 0 or last layer is full
        else {
            // Maximum volume for layer with radius "R"
            var maxV = Phys.layerVolume(self.layerHeight(), R);

            // How much substance will remain if fill layer
            residue = Vs - maxV;

            /* Layer volume after filling it with substance, if residue
            bigger than 0 then layer's volume takes maximum value. */
            var V = residue >= 0 ? maxV : maxV + residue;

            // Define mass and substances matter for layer
            var mass = Phys.mass(p, Vs);
            all_mass += mass;
            var subs = [substance.name];

            // Make the layer and add to matter
            var layer = {
                substances: subs,
                maxVolume: maxV,
                volume: V,
                mass: mass,
                density: p,
                radius: R,
                height: height
            };
            layers.push(layer);
        }

        // If the substance remains then change volume value
        if (residue > 0) {
            substance.volume = residue;
            R += height;
        }
        // If substance has filled all layer then change on next
        else {
            substance.volume = 0;
            index++;

            /* If substance has filles a layer and this layer is full
            then go to next layer */
            if (residue == 0) {
                R += height;
            }
        }

        core(R, index);
    })();

    this.mass_ = all_mass;
    this.layers_ = layers;
}
