var _listener = 5611;

function Connection(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Connection', 'options', options);
        options = {};
    }

    this.events = {
        close: [],
        connect: [],
        disablePlayer: [],
        distributionAnswer: [],
        enablePlayer: [],
        instancePlayer: []
    };

    // Handlers is callback function, requests from front end redirects into handler
    var handlers = new Storage;
    handlers.filter = (data => typeof data === 'function');
    this.handlers = handlers;

    this.maxTrashLength = options.maxTrashLength || 10000;

    this.initialize();
}

Object.defineProperties(Connection.prototype, {
    clients: {
        get: function() {
            return this.clients_;
        }
    },
    deadclients: {
        get: function() {
            return this.deadclients_;
        }
    },
    maxTrashLength: {
        get: function() {
            return this.maxTrashLength_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Connection#maxTrashLength', 'val', val);
                val = 10000;
            }

            this.maxTrashLength_ = val;
        }
    },
    socket: {
        get: function() {
            return this.socket_;
        }
    }
});

Connection.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        warn('Connection#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handler]) {
        warnfree(`Connection#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    var index = `${handler}_${this.events[handler].push(callback) - 1}`;

    return index;
}

Connection.prototype.addClient = function(websocket) {
    var self = this;

    var client = new Client({
        websocket: websocket
    });
    this.clients.push(client);

    this.handlers.each((callback, key) => {
        client.listen(key, callback);
    });

    reattach('instancePlayer');
    reattach('enablePlayer');
    reattach('distributionAnswer');

    return client;

    function reattach(handler) {
        client.attachEvent(handler, function() {
            Array.prototype.push.call(arguments, client);
            self.fireEvent(handler, arguments);
        });
    }
}

Connection.prototype.detachEvent = function(index) {
    if (typeof index !== 'string') {
        return;
    }

    var parsed = index.split('_');
    var handler = parsed[0],
        id = parsed[1];

    if (!this.events[handler]) {
        return;
    }

    this.events[handler].splice(id, 1);
}

Connection.prototype.fireEvent = function(handler, args) {
    var handlers = this.events[handler];

    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(handlers[i], args);
        }
    }
}

Connection.prototype.initialize = function() {
    var clients = new Storage;
    clients.filter = (data => data instanceof Client);
    this.clients_ = clients;

    var deadclients = new Storage;
    deadclients.filter = (data => data instanceof Client);
    this.deadclients_ = deadclients;

    // Clear deadclients if them length bigger then maximum limit
    deadclients.onadd = function(data, index, arr) {
        if (arr.numberkeyLength >= this.maxTrashLength) {
            arr.clear();
        }
    }

    var self = this;

    ;
    (function flow() {
        try {
            var socket = new ws.Server({
                port: _listener
            });
            self.socket_ = socket;
            console.log(`Websocket listener - ${_listener}`);
        } catch (err) {
            if (err) {
                logger.warnfree(`Connection: trying to connect to already occupied port, listener: ${_listener}`);
                _listener++;
                flow();
            }
        }
    })();

    this.socket.on('connection', websocket => {
        // Initialize new client
        var client = self.addClient(websocket);

        self.fireEvent('connect', [client]);

        websocket.on('message', response => {
            client.receive(response);
        });

        websocket.on('close', function() {
            self.removeClient(client);
            client.remove();

            self.fireEvent('close', [client]);
        });
    });
}

Connection.prototype.listen = function(handler, callback) {
    this.handlers.set(handler, callback);
}

Connection.prototype.removeClient = function(client) {
    var index = this.clients.indexOf(client);
    if (index != -1) {
        this.clients.remove(index);
        this.deadclients.push(client);

        this.fireEvent('disablePlayer', [client.player]);
    }
}

Connection.prototype.unlisten = function(handler, callback) {
    this.handlers.remove(handler, callback);
}

module.exports = Connection;

var ws = require('ws');
var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var Client = require('./client');
