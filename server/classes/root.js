function Root() {
    this.storages = {};

    this.initialize();
    this.initializeStream();
}

Object.defineProperties(Root.prototype, {
    connection: {
        get: function() {
            return this.connection_;
        }
    },
    distribution: {
        get: function() {
            return this.distribution_;
        }
    },
    generator: {
        get: function() {
            return this.generator_;
        }
    },
    map: {
        get: function() {
            return this.map_;
        }
    },
    mechanics: {
        get: function() {
            return this.mechanics_;
        }
    },
    spawner: {
        get: function() {
            return this.spawner_;
        }
    },
    updater: {
        get: function() {
            return this.updater_;
        }
    }
});

Root.prototype.configureConnection = function() {
    this.setConnectionListeners({
        client: this.responseClient.bind(this)
    });
}

Root.prototype.initialize = function() {
    var map = new Map(consts.MAP);
    this.map_ = map;

    // Connection binding and configuration setup
    var connection = new Connection;
    this.connection_ = connection;
    this.configureConnection();

    // Make new storage that collects all players on the server
    var players = new Storage;
    this.storages.players = players;

    connection.attachEvent('instancePlayer', player => {
        var sector = map.findSpawn(player);
        sector.addCluster(player);
    });
    connection.attachEvent('enablePlayer', player => {
        // If player was replaced for another client and enabled
        players.push(player);
    });
    connection.attachEvent('disablePlayer', player => {
        var index = players.indexOf(player);
        if (~index) {
            players.splice(index, 1);
        }
    });

    // Generates id, heavens
    this.generator_ = new Generator;

    // Updates with same interval
    var updater = new Updater({
        clients: connection.clients
    });
    this.updater_ = updater;

    // Game mechanic
    this.mechanics_ = new Mechanics({
        storages: this.storages
    });
}

/* Stream is always-updating function that changes items state
and always controlls physics, rigidbody, colliders, etc. */
Root.prototype.initializeStream = function() {
    var self = this;

    this.updater.push(options => {
        self.streamUpdate(options);
    });
}

// When client answers on distribution from server
Root.prototype.onDistributionAnswer = function(response, time, client) {
    var data = response.data;

    // If client haven't binded player
    if (!client.player) {
        return;
    }

    client.player.setChanges(data, time);
}

// On request from front-end on "Client"-handler
Root.prototype.responseClient = function(response, client) {
    var data = response.data;

    var method = data.method;

    switch (method) {
        case 'getId':
            // If client asking for id then create new Player
            var player = client.instancePlayer({
                generator: this.generator
            });

            response.answer(player.id);

            break;

        case 'continueSession':
            /* If client asking for continue session by his ID, then check
            in the "dead" clients do any of them have equal id. So replace
            player from matched client else return false answer */
            var id = data.id;

            var connection = this.connection;

            // We need client's index, because need to splice from array
            var index;
            var matches = connection.deadclients.find((client, ind) => {
                if (client.player && client.player.id == id) {
                    index = ind;
                    return true;
                } else {
                    return false;
                }
            });

            if (typeof index !== 'undefined') {
                // remove client from dead-storage and make inheritance for new
                client.inherit(matches[matches.length - 1]);
                connection.deadclients.splice(index, 1);

                response.answer(true);
            } else {
                response.answer(false);
            }

            break;
    }
}

// Set listeners to Connection and calls callback on valid request from client
Root.prototype.setConnectionListeners = function(options) {
    if (typeof options !== 'object') {
        logger.warn('Root#setConnectionListeners', 'options', options);
        return;
    }

    var connection = this.connection;

    for (var i in options) {
        if (!options.hasOwnProperty(i)) {
            continue;
        }

        var callback = options[i];

        if (typeof callback !== 'function') {
            logger.warn('Root#setConnectionListeners', `callback ${i}`, callback);
            continue;
        }

        connection.listen(i, callback);
    }
}

// Makes distribution to client updating by updater
Root.prototype.setupDistribution = function(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Root#setupDistribution', 'options', options);
        options = {};
    }

    var distribution = new Distribution(this.updater, options);
    this.distribution_ = distribution;

    var self = this;
    // change visible items for each client
    distribution.attachEvent('beforeClientSend', (client, stack, out) => {
        var sector = client.sector;

        out.players = sector.filterClusters(client.player, stack.players);
        out.npcs = sector.filterClusters(client.player, stack.npcs);
    });

    // collect all items before new distribution and set in memory
    distribution.attachEvent('beforeSend', function() {
        var players = [],
            npcs = [];

        self.map.sectors.each(sector => {
            sector.players.each(player => {
                players.push(player.toJSON());
            });

            sector.npcs.each(npc => {
                npcs.push(npc.toJSON());
            });
        });

        distribution.setInMemory('players', players);
        distribution.setInMemory('npcs', npcs);
    });

    // On answer from client redirect response to function
    this.connection.attachEvent('distributionAnswer', (response, time, client) => {
        self.onDistributionAnswer(response, time, client);
    });

    distribution.start();
}

// check can player see the item
function filterSafeRange(cluster, clusters) {
    var out = [];

    if (!cluster || !cluster.isReady()) {
        return out;
    }

    var item0 = cluster.item;

    var range = item0.physic.diameter * consts.VISION_RANGE;

    for (var i = 0; i < clusters.length; i++) {
        var cluster = clusters[i];

        if (!cluster.item) {
            continue;
        }

        var item1 = cluster.item;

        var pos = item1.body.position;
        pos = new Vec3(pos[0], pos[1], pos[2]);

        var length = amc('-', item0.body.position, pos).length() - item1.physic.diameter / 2;
        if (length <= range) {
            out.push(cluster);
        }
    }

    return out;
}

// Creates npcs in interval by updater and generator
Root.prototype.setupSpawner = function(options = {}) {
    options.generator = this.generator;
    options.updater = this.updater;

    var spawner = new Spawner(options);
    this.spawner_ = spawner;

    // Add to storages "npcs" by spawner
    this.storages.npcs = spawner.npcs;

    spawner.start();
}

// updated by Updater, like FPS in front-end
Root.prototype.streamUpdate = function(options) {
    this.mechanics.update(options);
}

module.exports = Root;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var Client = require('./client');
var Item = require('../engine/item');
var Connection = require('./connection');
var Spawner = require('./spawner');
var Updater = require('./updater');
var Distribution = require('./distribution');
var Generator = require('./generator');
var Mechanics = require('./mechanics');
var consts = require('./constants');
var math = require('../engine/math');
var Map = require('./map');
var amc = math.amc;
var v = require('../engine/vector');
var Vec3 = v.Vec3;