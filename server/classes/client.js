function Client(options) {
    var websocket = options.websocket;

    this.websocket = websocket;
    this.ip = Math.random() + '';
    // websocket._socket.remoteAddress || websocket.upgradeReq.connection.remoteAddress;

    this.events = {
        distributionAnswer: [],
        enablePlayer: [],
        instancePlayer: [],
        remove: []
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

Client.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        warn('Client#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        warnfree(`Client#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

// Decrease distribution time by delta time and returns: is it time for distribution
Client.prototype.checkOnDistribution = function(deltaTime) {
    this.distributionTime -= deltaTime;

    // If client can get data and it's time to distribution for him
    return (this.throughput >= 0 && this.distributionTime <= 0);
}

// Creates auto-callback on sended data to client (creates automatically)
Client.prototype.createAnswer = function(callback, lifetime, startLifetime) {
    var time = Date.now();
    var handler = new Handler(callback, lifetime, startLifetime || time);

    this.removeExpiredAnsweres(time);

    var index = this.freehandlers[0];
    if (typeof index !== 'undefined') {
        this.answers.set(index, handler);
        this.freehandlers.splice(0, 1);
    } else {
        index = this.answers.push(handler) - 1;
    }

    return index;
}

Client.prototype.detachEvent = function(handler) {
    if (!(handler instanceof Array)) {
        return;
    }

    var handlername = handler[0],
        callback = handler[1];

    var event = this.events[handlername];
    if (!event) {
        return;
    }

    event.splice(event.indexOf(callback), 1);
}

/* Makes distribution to client, sets how much time need to next distribution
and checks answer from client then send to "distributionAnswer"-callback */
Client.prototype.distribute = function(data, time, minrate, maxrate) {
    if (typeof time !== 'number') {
        logger.warn('Client#distribute', 'time', time);
        time = 0;
    }

    var lastDistributionTime = this.lastDistributionTime;
    this.lastDistributionTime = time;

    var self = this;
    var size = this.send('client', {
        method: 'distribution',
        stack: data
    }, function(response) {
        // If last answer was latter instantiated than current then break
        if (time < self.lastAnswerTime) {
            return;
        }
        self.lastAnswerTime = time;

        var answertime = Date.now();

        /* Not really latency, this is how much time passed before
        start distribution time and answer */
        var latency = answertime - lastDistributionTime;

        self.fireEvent('distributionAnswer', [response, latency]);
    }, {
        lifetime: minrate
    });

    // How much time left to next distribution
    this.distributionTime = Math.max(maxrate, Math.min(size / this.throughput, minrate));
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

Client.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
        }
    }
}

// Does answer exist
Client.prototype.isAnswer = function(key) {
    return (this.answers.get(key) instanceof Handler);
}

// Copy player itself
Client.prototype.inherit = function(clone) {
    this.player = clone.player;

    this.fireEvent('enablePlayer', [this.player]);
}

// Creates new player for client and returns it
Client.prototype.instancePlayer = function(options) {
    if (typeof options !== 'object') {
        logger.warn('Client#instancePlayer', 'options', options);
        options = {};
    }

    var player = new Player(options);
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

// Client remove function
Client.prototype.remove = function() {
    this.fireEvent('remove');
}

Client.prototype.removeAnswer = function(key) {
    this.answers.remove(key);
    this.freehandlers.push(key);
}

// Checks all answers on expiration
Client.prototype.removeExpiredAnsweres = function(time) {
    var self = this;
    this.answers.each((handler, index) => {
        if (handler.checkIsExpired(time)) {
            self.removeAnswer(index);
        }
    });
}

// Completes "send"-function from websocket-script
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
var Generator = require('./generator');
