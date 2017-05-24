/**
 * User's connection to websocket.
 */
function Client(options = {}) {
    // Handlers is storage for ANSWER-callbacks by server
    this.handlers = [];

    /* Free handlers array contains numbers of empty array-positions,
    it needs for optimization: handlers array will not be inifnite big,
    freehandlers will fill empty key-positions */
    this.freehandlers = [];
}

// Executes handler and remove, is called by answer
Client.prototype.execHandler = function(key, data) {
    if (!this.isHandler(key)) {
        return false;
    }

    var handler = this.handlers[key];
    handler.callback(data);

    this.removeHandler(key);

    return true;
}

Client.prototype.isHandler = function(key) {
    return (this.handlers[key] instanceof Handler);
}

/**
 * Removes excpired handlers.
 * @param  {Number} date Current time (in miliseconds)
 */
Client.prototype.removeExpiredHandlers = function(date) {
    if (typeof date !== 'number') {
        console.once('removeExpiredHandlers', () => {
            console.log(`Client: removeExpiredHandlers: uncorrect "date" sended, type: ${typeof date}, value: ${date}`);
        });

        return;
    }

    for (var i = 0; i < this.handlers.length; i++) {
        if (!this.isHandler(i)) {
            continue;
        }

        var handler = this.handlers[i];
        if (!handler.startLifetime) {
            handler.startLifetime = date;
        }

        if (date > handler.startLifetime + handler.lifetime) {
            this.removeHandler(i);
        }
    }
}

Client.prototype.removeHandler = function(key) {
    if (!this.isHandler(key)) {
        return false;
    }

    delete this.handlers[key];
    this.freehandlers.push(key);

    return true;
}

// Sets answer-callback
Client.prototype.setHandler = function(callback, {
    lifetime = 15000
} = {}) {
    if (typeof callback !== 'function') {
        console.warn(`Client: setHandler: "callback" must be a function, type: ${typeof callback}, value: ${callback}, lifetime: ${lifetime}`);
        return false;
    } else if (typeof lifetime !== 'number') {
        console.warn(`Client: setHandler: "lifetime" must be a number, type: ${typeof lifetime}, value: ${lifetime}, callback: ${callback.toString()}`);
        lifetime = 15000;
    }

    var handler = new Handler({
        callback: callback,
        lifetime: lifetime
    });

    var index = this.freehandlers[0];
    if (typeof index === 'number') {
        this.handlers[index] = handler;
        this.freehandlers.splice(0, 1);
    } else {
        index = this.handlers.push(handler) - 1;
    }

    return index;
}

// Helps to understand when callback expires
function Handler(options = {}) {
    if (typeof options !== 'object') {
        warn('Handler', 'options', options);
        options = {};
    }

    this.callback = options.callback;
    this.lifetime = options.lifetime || 0;
    this.startLifetime = options.startLifetime || 0;
}

Object.defineProperties(Handler.prototype, {
    callback: function() {
        get: function() {
            return this.callback_;
        },
        set: function() {
            if (typeof val !== 'function') {
                warn('Handler#callback', 'val', val);
                val = function() {};
            }

            this.callback_ = val;
        }
    },
    lifetime: function() {
        get: function() {
            return this.lifetime_;
        },
        set: function() {
            if (typeof val !== 'number') {
                warn('Handler#lifetime', 'val', val);
                val = 0;
            }

            this.lifetime_ = val;
        }
    },
    startLifetime: function() {
        get: function() {
            return this.startLifetime_;
        },
        set: function() {
            if (typeof val !== 'number') {
                warn('Handler#startLifetime', 'val', val);
                val = 0;
            }

            this.startLifetime_ = val;
        }
    }
});
