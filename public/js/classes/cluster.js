function Cluster() {}

Object.defineProperties(Cluster.prototype, {
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number' && typeof val !== 'string') {
                warn('Cluster#id', 'val', val);
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
            if (val && !(val instanceof Item)) {
                warn('Cluster#item', 'val', val);
                val = new Heaven;
            }

            this.item_ = val;
        }
    }
});

Cluster.prototype.disable = function() {
    if (this.item) {
        this.item.enabled = false;
    }
}

Cluster.prototype.enable = function() {
    if (this.item) {
        this.item.enabled = true;
    }
}

Cluster.prototype.update = function(data, time) {
    if (typeof data !== 'object') {
        warn('Cluster#update', 'data', data);
        return;
    }

    var status = data.status;

    var item = data.item;

    if (item) {
        if (!this.item) {
            this.item = new Heaven;
        }

        this.item.addTempData(item, time);
        this.item.setAttribute('status', status);
    }
    else {
        this.item = undefined;
    }

    this.enable();
}

function Player(options = {}) {
    if (typeof options !== 'object') {
        warn('Player', 'options', options);
        options = {};
    }

    Cluster.call(this, options);
}

Player.prototype = Object.create(Cluster.prototype);
Player.prototype.constructor = Player;

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
    }
});

Player.prototype.getDistributionData = function() {
    var request = {};

    if (this.item) {
        var itrigid = this.item.rigidbody;
        request.item = itrigid.getActions(true);
        itrigid.clearActions();
    }

    return request;
}

Player.prototype.updateAlive = function(data, time) {
    if (typeof data !== 'object') {
        warn('Player#updateAlive', 'data', data);
        return;
    }

    this.update(data, time);
}

function NPC(options = {}) {
    if (typeof options !== 'object') {
        warn('NPC', 'options', options);
        options = {};
    }

    Cluster.call(this, options);
}

NPC.prototype = Object.create(Cluster.prototype);
NPC.prototype.constructor = NPC;

Object.defineProperties(NPC.prototype, {});
