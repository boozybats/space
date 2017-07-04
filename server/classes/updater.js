function Updater(storages = {}, frequency = 1000 / 60) {
    this.frequency = frequency;

    this.storages = {};
    this.callbacks = {};

    this.initializeStorages(storages);

    this.isStopped = false;

    this.start();
}

Object.defineProperties(Updater.prototype, {
    frequency: {
        get: function() {
            return this.frequency_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Updater#frequency', 'val', val);
                val = 1000 / 60;
            }

            this.frequency_ = val;
        }
    }
});

Updater.prototype.initializeStorage = function(key, storage) {
    if (!(storage instanceof Storage)) {
        logger.warn('Updater#initializeStorage', 'storage', storage);
        return;
    }

    this.storages[key] = storage;
}

Updater.prototype.initializeStorages = function(storages) {
    if (typeof storages !== 'object') {
        logger.warn('Updater#initializeStorages', 'storages', storages);
        storages = {};
    }

    for (var i in storages) {
        if (!storages.hasOwnProperty(i)) {
            continue;
        }

        var storage = storages[i];

        this.initializeStorage(i, storage);
    }
}

Updater.prototype.push = function(callback, area = 'start') {
    if (typeof callback !== 'function') {
        logger.warn('Updater#push', 'callback', callback);
        return;
    }
    if (typeof area !== 'string') {
        logger.warn('Updater#push', 'area', area);
        area = 'main';
    }

    if (!this.callbacks[area]) {
        this.callbacks[area] = [callback];
    } else {
        this.callbacks[area].push(callback);
    }

    return [area, callback];
}

Updater.prototype.remove = function(handler) {
    if (!(handler instanceof Array)) {
        logger.warn('Updater#remove', 'handler', handler);
        return;
    }

    var area = handler[0],
        callback = handler[1];

    var callbacks = this.callbacks[area];
    var index = callbacks.indexOf(callback);

    callbacks.splice(index, 1);
}

Updater.prototype.start = function() {
    this.isStopped = false;

    var self = this;

    ;
    (function update() {
        if (self.isStopped) {
            return;
        }

        self.update();

        setTimeout(update, self.frequency);
    })();
}

Updater.prototype.stop = function() {
    this.isStopped = true;
}

Updater.prototype.update = function() {
    var n_time = Date.now();
    var o_time = this.oldTime || n_time;
    var delta = n_time - o_time;

    var callbacks = this.callbacks;

    var area = callbacks.start;
    if (area) {
        for (var i = 0; i < area.length; i++) {
            var callback = area[i];
            callback({
                time: n_time,
                deltaTime: delta
            });
        }
    }

    var storages = this.storages;
    for (var i in storages) {
        if (!storages.hasOwnProperty(i)) {
            continue;
        }

        var storage = storages[i];

        area = callbacks[i];
        if (area) {
            for (var j = 0; j < area.length; j++) {
                var callback = area[j];
                storage.each(data => {
                    callback({
                        time: n_time,
                        deltaTime: delta,
                        data: data
                    });
                });
            }
        }
    }

    area = callbacks.end;
    if (area) {
        for (var i = 0; i < area.length; i++) {
            var callback = area[i];
            callback({
                time: n_time,
                deltaTime: delta
            });
        }
    }

    o_time = n_time;
    this.oldTime = o_time;
}

module.exports = Updater;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
