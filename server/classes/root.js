function Root() {
    this.initialize();
    this.initializeStorages();

    this.configureConnection();
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
    this.generator_ = new Generator;

    var connection = new Connection;
    this.connection_ = connection;

    var updater = new Updater({
        clients: connection.clients
    });
    this.updater_ = updater;
}

Root.prototype.initializeStorages = function() {
    var storages = {};

    var players = new Storage;

    var connection = this.connection;
    connection.attachEvent('instancePlayer', player => {
        players.push(player);
    });
    connection.attachEvent('enablePlayer', player => {
        players.push(player);
    });
    connection.attachEvent('disablePlayer', player => {
        var index = players.indexOf(player);
        if (~index) {
            players.splice(index, 1);
        }
    });

    storages.players = players;

    this.storages = storages;
}

Root.prototype.onDistributionAnswer = function(response, time, client) {
    if (typeof response !== 'object') {
        logger.warn('Root#onDistributionAnswer', 'response', response);
        return;
    }

    var data = response.data;
    if (typeof data !== 'object') {
        logger.warn('Root#responseClient', 'data', data);
        return;
    }

    if (!client.player) {
        return;
    }

    if (typeof data.item === 'object') {
        client.player.item.setChanges(data.item, time);
    }
}

Root.prototype.responseClient = function(response, client) {
    if (typeof response !== 'object') {
        logger.warn('Root#responseClient', 'response', response);
        return;
    }

    var data = response.data;
    if (typeof data !== 'object') {
        logger.warn('Root#responseClient', 'data', data);
        return;
    }

    var method = data.method;

    switch (method) {
        case 'getId':
            var player = client.instancePlayer({
                generator: this.generator
            });

            response.answer(player.id);

            break;

        case 'continueSession':
            var id = data.id;

            var connection = this.connection;

            var index;
            var deads = connection.deadclients.find((client, ind) => {
                if (client.player && client.player.id == id) {
                    index = ind;
                    return true;
                } else {
                    return false;
                }
            });

            if (typeof index !== 'undefined') {
                client.inherit(deads[deads.length - 1]);
                connection.deadclients.splice(index, 1);

                response.answer(true);
            } else {
                response.answer(false);
            }

            break;
    }
}

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

Root.prototype.setupDistribution = function(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Root#setupDistribution', 'options', options);
        options = {};
    }

    var distribution = new Distribution(this.updater, options);
    this.distribution_ = distribution;

    var self = this;
    distribution.attachEvent('beforeSend', function() {
        var players = [];
        self.storages.players.each(player => {
            if (player.isReady()) {
                players.push(player.toJSON());
            }
        });

        var npcs = [];
        if (self.storages.npcs) {
            self.storages.npcs.each(npc => {
                npcs.push(npc.toJSON());
            });
        }

        distribution.setInMemory('players', players);
        distribution.setInMemory('npcs', npcs);
    });

    this.connection.attachEvent('distributionAnswer', (response, time, client) => {
        self.onDistributionAnswer(response, time, client);
    });

    distribution.start();
}

Root.prototype.setupSpawner = function(options = {}) {
    options.generator = this.generator;
    options.updater = this.updater;

    var spawner = new Spawner(options);
    this.spawner_ = spawner;

    this.storages.npcs = spawner.npcs;

    spawner.start();
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
