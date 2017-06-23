function Client(options) {
    var websocket = options.websocket;

    this.websocket = websocket;
    this.ip = Math.random() + '';
    // websocket._socket.remoteAddress || websocket.upgradeReq.connection.remoteAddress;

    this.events = {
        enablePlayer: [],
        instancePlayer: []
    };

    // Handlers contains permanent binded user's listeners
    var handlers = new Storage;
    handlers.filter = (data => typeof data === 'function');
    this.handlers = handlers;

    /* Free handlers array contains numbers of empty array-positions,
    it needs for optimization: handlers array will not be inifnite big,
    freehandlers will fill empty key-positions */
    var answers = new Storage;
    answers.filter = (data => data instanceof Handler);
    this.answers = answers;
    this.freehandlers = [];

    // b/ms
    this.throughput_ = 0;
    // latency between server and client
    this.ping_ = 0;
    // Time to next distribution
    this.distributionTime = 0;

    this.updateConnectionInfo();
}

Object.defineProperties(Client.prototype, {
    distributionTime: {
        get: function() {
            return this.distributionTime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Client#distributionTime', 'val', val);
                val = 0;
            }

            this.distributionTime_ = val;
        }
    },
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Client#id', 'val', val);
                val = -1;
            }

            this.id_ = val;
        }
    },
    ip: {
        get: function() {
            return this.ip_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                logger.warn('Client#ip', 'val', val);
                val = '0.0.0.0';
            }

            this.ip_ = val;
        }
    },
    ping: {
        get: function() {
            return this.ping_;
        }
    },
    player: {
        get: function() {
            return this.player_;
        },
        set: function(val) {
            if (!(val instanceof Player)) {
                logger.warn('Client#player', 'val', val);
                val = {};
            }

            this.player_ = val;
        }
    },
    throughput: {
        get: function() {
            return this.throughput_;
        }
    },
    websocket: {
        get: function() {
            return this.websocket_;
        },
        set: function(val) {
            if (!val) {
                logger.error('Client#websocket', 'val', val);
                return;
            }

            this.websocket_ = val;
        }
    }
});

Client.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        warn('Client#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handler]) {
        warnfree(`Client#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    var index = `${handler}_${this.events[handler].push(callback) - 1}`;

    return index;
}

Client.prototype.checkOnDistribution = function(deltaTime) {
    this.distributionTime -= deltaTime;

    // If client can get data and it's time to distribution for him
    return (this.throughput >= 0 && this.distributionTime <= 0);
}

Client.prototype.createAnswer = function(callback, lifetime, startLifetime) {
    var handler = new Handler(callback, lifetime, startLifetime);

    var index = this.freehandlers[0];
    if (typeof index === 'number') {
        this.answers.set(index, handler);
        this.freehandlers.splice(0, 1);
    } else {
        index = this.answers.push(handler) - 1;
    }

    return index;
}

Client.prototype.detachEvent = function(index) {
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

Client.prototype.distribute = function(data, time, lifetime) {
    if (typeof time !== 'number') {
        logger.warn('Client#distribute', 'time', time);
        time = 0;
    }
    if (typeof lifetime !== 'number') {
        logger.warn('Client#distribute', 'lifetime', lifetime);
        lifetime = 1000;
    }

    this.lastDistributionTime = time;

    var self = this;
    var size = this.send('client', {
        method: 'distribution',
        stack: data
    }, function(response) {
        if (time === self.lastDistributionTime) {
            self.distributionTime = 0;
        }

        // If last answer was latter instantiated than current then break
        if (time < self.lastAnswerTime) {
            return;
        }
        self.lastAnswerTime = time;

        /* Not really latency, this is how much time passed before
        start distribution time and answer */
        var latency = Date.now() - time;

        self.receiveDistributionAnswer(response);
    }, {
        lifetime: lifetime
    });

    // How much time left to next distribution (choose minimal)
    this.distributionTime = Math.min(size / this.throughput, lifetime);
}

// Executes answer and deletes it
Client.prototype.execAnswer = function(key, request) {
    if (!this.isAnswer(key)) {
        return false;
    }

    var answer = this.answers.get(key);

    var isExpired = answer.checkIsExpired();

    if (!isExpired) {
        answer.callback.call(this, request);
    }

    this.removeAnswer(key);

    return true;
}

Client.prototype.fireEvent = function(handler, args) {
    var handlers = this.events[handler];

    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(handlers[i], args);
        }
    }
}

// Does answer exist
Client.prototype.isAnswer = function(key) {
    return (this.answers.get(key) instanceof Handler);
}

Client.prototype.inherit = function(clone) {
    this.player = clone.player;

    this.fireEvent('enablePlayer', [this.player]);
}

Client.prototype.instancePlayer = function(id = -1) {
    if (typeof id !== 'number') {
        logger.warn('Client#instancePlayer', 'id', id);
        id = -1;
    }

    var player = new Player(id);
    this.player = player;

    this.fireEvent('instancePlayer', [player]);

    return player;
}

// Bind permanent handler to connection
Client.prototype.listen = function(handler, callback) {
    this.handlers.set(handler, callback);
}

// Adds answer function in request if it needs
Client.prototype.modifyResponse = function(json) {
    if (typeof json !== 'object') {
        logger.warn('Client#modifyResponse', 'json', json);
        json = {};
    }

    var out = {
        handler: json.handler,
        data: json.data
    };

    var answerkey = json.answer;
    if (typeof answerkey !== 'undefined') {
        var self = this;
        out.answer = function(data, answer) {
            self.send(answerkey, data, answer);
        }
    } else {
        out.answer = function() {};
    }

    return out;
}

// Receives messages from server and call them in handlers
Client.prototype.receive = function(data) {
    if (typeof data !== 'string') {
        return;
    }

    try {
        var json = JSON.parse(data);
    } catch (err) {
        if (err) {
            return;
        }
    }

    var response = this.modifyResponse(json);
    var handler = response.handler;

    // Check if it answer else check in handlers
    if (!this.execAnswer(handler, response) && this.handlers.get(handler)) {
        handler = this.handlers.get(handler);
        handler.call(this, response, this);
    }
}

Client.prototype.receiveDistributionAnswer = function(response) {}

Client.prototype.remove = function() {}

Client.prototype.removeAnswer = function(key) {
    this.answers.remove(key);
    this.freehandlers.push(key);
}

/* Completes "send"-function from websocket-script, but automaticly
sends "ip" */
Client.prototype.send = function(handler, data, callback, options = {}) {
    if (typeof handler !== 'string' && typeof handler !== 'number') {
        logger.warn('Client#send', 'handler', handler);
    }
    if (typeof options !== 'object') {
        logger.warn('Client#send', 'options', options);
        options = {};
    }

    // Data to send to front end
    var request = {
        handler: handler,
        data: data
    };

    // If needs a callback from front enmd than set answer-callback
    if (typeof callback === 'function') {
        request.answer = this.createAnswer(callback, options.lifetime);
    }

    try {
        var json = JSON.stringify(request);
        this.websocket.send(json);
    } catch (err) {
        if (err) {
            return 0;
        }
    }

    return json.length;
}

// Bind permanent handler to connection
Client.prototype.unlisten = function(handler, callback) {
    this.handlers.remove(handler, callback);
}

// Updates client throughput and ping
Client.prototype.updateConnectionInfo = function() {
    // Data to send to client
    var request = {
        handler: 'client',
        data: {
            method: 'connectionTest'
        }
    };

    var self = this;
    // Start position of message size
    var size = 0;
    // How much time passes between server and client
    var ping = 0;
    /* How much time latency needs to stop tests, the more it is bigger
    the more specific results it have but spends more time */
    var boundtime = 300;
    var date;

    // First callback defines ping then change on detemined
    this.send(request.handler, request.data, function() {
        /* Approximate value of ping, divided on two because client->server
        have latency too, needs only server->client */
        ping = (Date.now() - date) / 2;
        self.ping_ = ping;

        send();
    });
    date = Date.now();

    // Sends data with message by index "size" to client
    function send() {
        request.data.message = bigdata[size];
        self.send(request.handler, request.data, callback);

        date = Date.now();
    }

    function callback() {
        // Approximate latency, this shouldn't take latency from client to server
        var latency = (Date.now() - date) - ping;

        // If message are got faster than bound time then send bigger one
        if (latency < boundtime && bigdata[size + 1]) {
            size++;
            send();
        } else {
            size = bigdata[size].length;

            self.throughput_ = Math.trunc(size / latency);
        }
    }
}

function Handler(callback, lifetime, startLifetime) {
    this.callback = callback;
    this.lifetime = lifetime || Infinity;
    this.startLifetime = startLifetime || Date.now();
}

Object.defineProperties(Handler.prototype, {
    callback: {
        get: function() {
            return this.callback_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                logger.warn('Handler#callback', 'val', val);
                val = function() {};
            }

            this.callback_ = val;
        }
    },
    lifetime: {
        get: function() {
            return this.lifetime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                val = Infinity;
            }

            this.lifetime_ = val;
        }
    },
    startLifetime: {
        get: function() {
            return this.startLifetime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                val = Date.now();
            }

            this.startLifetime_ = val;
        }
    }
});

Handler.prototype.checkIsExpired = function(date) {
    if (typeof date !== 'number') {
        date = Date.now();
    }

    return date > this.startLifetime + this.lifetime;
}

// Big message to send client and check throughput
var bigdata = ['', '', '', '', '', '', '', ''];

;
(function() {
    // 1 Kb
    for (var i = 1024; i--;) {
        bigdata[0] += '0';
    }

    // 10 Kb
    for (var i = 10; i--;) {
        bigdata[1] += bigdata[0];
    }

    // 100 Kb
    for (var i = 10; i--;) {
        bigdata[2] += bigdata[1];
    }

    // 1 Mb
    for (var i = 1024; i--;) {
        bigdata[3] += bigdata[0];
    }

    // 10 Mb
    for (var i = 10; i--;) {
        bigdata[4] += bigdata[3];
    }

    // 20 Mb
    for (var i = 2; i--;) {
        bigdata[5] += bigdata[4];
    }

    // 40 Mb
    for (var i = 2; i--;) {
        bigdata[6] += bigdata[5];
    }

    // 80 Mb
    for (var i = 2; i--;) {
        bigdata[7] += bigdata[6];
    }
})();

module.exports = Client;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var Player = require('./player');
