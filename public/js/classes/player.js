function Player() {}

Object.defineProperties(Player.prototype, {
    facebox: {
        get: function() {
            return this.facebox_;
        },
        set: function(val) {
            if (!(val instanceof Item)) {
                warn('Player#facebox', 'val', val);
                val = new Facebox;
            }

            this.facebox_ = val;
        }
    },
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number' && typeof val !== 'string') {
                warn('Player#id', 'val', val);
                val = -2;
            }

            this.id_ = val;
        }
    },
    item: {
        get: function() {
            return this.item_;
        },
        set: function(val) {
            if (!(val instanceof Item)) {
                warn('Player#item', 'val', val);
                val = new Heaven;
            }

            this.item_ = val;
        }
    }
});

Player.prototype.disable = function() {
    if (this.item) {
        this.item.enabled = false;
    }
}

Player.prototype.enable = function() {
    if (this.item) {
        this.item.enabled = true;
    }
}

Player.prototype.getDistributionData = function() {
    var request = {};

    if (!this.item) {
        errorfree('Player#getDistributionData: player must have an item');
        return;
    }

    var itrigid = this.item.rigidbody;
    request.item = itrigid.getActions(true);
    itrigid.clearActions();

    return request;
}

Player.prototype.updateAlive = function(data, time) {
    if (typeof data !== 'object') {
        warn('Player#updateAlive', 'data', data);
        return;
    }


    this.enable();

    this.updateThird(data, time);
}

Player.prototype.updateThird = function(data, time) {
    if (typeof data !== 'object') {
        warn('Player#updateThird', 'data', data);
        return;
    }

    this.enable();

    var item = data.item;

    if (item && this.item) {
        this.item.addTempData(item, time);
    }
}
