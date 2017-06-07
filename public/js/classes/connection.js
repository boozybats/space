function Connection(url) {
    var websocket = new WebSocket(url);
    this.socket_ = websocket;

    // TODO: сделать один массив handler'ов, заместо двух

    // Handlers contains permanent binded user's listeners
    var handlers = new Storage;
    handlers.filter = (data => typeof data === 'function');
    this.handlers = handlers;

    // Answers contains callbacks on user's requests
    var answers = new Storage;
    answers.filter = (data => data instanceof Handler);
    this.answers = answers;
    this.freehandlers = [];

    this.initialize();
}

Object.defineProperties(Connection.prototype, {
    socket: {
        get: function() {
            return this.socket_;
        }
    }
});

// Creates handler with selected parameters and return index of this handler
Connection.prototype.createAnswer = function(callback, lifetime, startLifetime) {
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

// Executes answer and deletes it
Connection.prototype.execAnswer = function(key, request) {
    if (!this.isAnswer(key)) {
        return;
    }

    var answer = this.answers.get(key);

    var isExpired = answer.checkIsExpired();

    if (!isExpired) {
        answer.callback(request);
    }

    this.removeAnswer(key);
}

// Setup websocket native functions
Connection.prototype.initialize = function() {
    var socket = this.socket_;
    var self = this;

    socket.onopen = function() {
        self.ready = true;
        if (typeof self.onready === 'function') {
            self.onready();
        }
    }

    socket.onclose = function() {
        self.ready = false;
        if (typeof self.onclose === 'function') {
            self.onclose();
        }
    }

    socket.onmessage = function(response) {
        if (!response.isTrusted) {
            return;
        }

        self.receive(response.data);
    }
}

// Does answer exist
Connection.prototype.isAnswer = function(key) {
    return (this.answers.get(key) instanceof Handler);
}

// Bind permanent handler to connection
Connection.prototype.listen = function(handler, callback) {
    this.handlers.set(handler, callback);
}

// Adds answer function in request if it needs
Connection.prototype.modifyResponse = function(json) {
    if (typeof json !== 'object') {
        warn('Connection#modifyResponse', 'json', json);
        json = {};
    }

    var out = {
        handler: json.handler,
        data: json.data
    };

    var answerkey = json.answer;
    if (answerkey) {
        var self = this;
        out.answer = function(data, answer) {
            self.send(answerkey, data, answer);
        }
    }

    return out;
}

// Receives messages from server and call them in handlers
Connection.prototype.receive = function(data) {
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
    if (this.isAnswer(handler)) {
        this.execAnswer(handler, response);
    } else if (this.handlers[handler]) {
        this.handlers[handler](response);
    }
}

Connection.prototype.removeAnswer = function(key) {
    if (!this.answers(key)) {
        return;
    }

    delete this.handlers[key];
    this.freehandlers.push(key);
}

// If answer time expired then removes it
Connection.prototype.removeExpiredAnswers = function(date) {
    if (typeof date !== 'number') {
        date = Date.now();
        return;
    }

    var self = this;
    this.answers.each((answer, key) => {});
}

// Send message on server
Connection.prototype.send = function(handler, data, callback, options = {}) {
    if (typeof options !== 'object') {
        warn('Connection#send', 'options', options);
        options = {};
    }

    // Wait websockets loading
    if (!this.ready) {
        var self = this;
        setTimeout(function() {
            self.send.apply(self, arguments);
        }, 100);

        return;
    }

    // Data to send to server
    var request = {
        handler: handler,
        data: data
    };

    // If needs a callback from server than set callback
    if (typeof callback === 'function') {
        request.answer = this.createAnswer(callback, options.lifetime);
    }

    try {
        this.socket.send(JSON.stringify(request));
    } catch (err) {
        if (err) {
            warn(`Connection#send: ${err.text}`);
        }
    }
}

// Remove permanent listener
Connection.prototype.unlisten = function(handler) {
    self.handlers.remove(handler);
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
                warn('Handler#callback', 'val', val);
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
                warn('Handler#lifetime', 'val', val);
                val = 0;
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
                warn('Handler#startLifetime', 'val', val);
                val = 0;
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
