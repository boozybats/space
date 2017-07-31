/**
 * Creates canvas dom-element, sets width and
 * height for it. Required for {@link WebGLRenderer}.
 * @this {Canvas}
 * @param {Number} width
 * @param {Number} height
 * @class
 * @property {Project} project Current binded project to the canvas
 */
function Canvas(width, height) {
    var canvas = document.createElement('canvas');
    this.canvas_ = canvas;
    // if browser doesn't support canvas
    canvas.innerText = "Your browser doesn't support html5, please install another one";

    this.handlers = {
        axis: []
    };

    this.width = width || RESOLUTION_WIDTH;
    this.height = height || RESOLUTION_HEIGHT;

    this.initialize();
}

Object.defineProperties(Canvas.prototype, {
    canvas: {
        get: function() {
            return this.canvas_;
        }
    },
    height: {
        get: function() {
            return this.height_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Canvas#height', 'val', val);
                val = 0;
            }

            this.canvas.height = val;
            this.height_ = val;
        }
    },
    width: {
        get: function() {
            return this.width_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Canvas#width', 'val', val);
                val = 0;
            }

            this.canvas.width = val;
            this.width_ = val;
        }
    }
});

/**
 * Appends canvas dom-element to choosen dom-element,
 * returns true if successful, else returns false.
 * @return {Boolean}
 * @method
 * @example
 * var canvasClass = new Canvas(1280, 768);
 * canvasClass.apendTo(document.body);
 */
Canvas.prototype.appendTo = function(element) {
    if (!(element instanceof HTMLElement)) {
        warn('Canvas#appendTo', 'element', element);
        return false;
    }

    if (element.appendChild(this.canvas)) {
        return true;
    } else {
        warnfree(`Canvas#appendTo: canvas can not be appended to element ${element}`);
        return false;
    }
}

Canvas.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        warn('Canvas#attachEvent', 'callback', callback);
        return;
    }
    if (!this.handlers[handler]) {
        warnfree(`Canvas#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    var index = `${handler}_${this.handlers[handler].push(callback) - 1}`;

    return index;
}

Canvas.prototype.detachEvent = function(index) {
    if (typeof index !== 'string') {
        return;
    }

    var parsed = index.split('_');
    var handler = parsed[0],
        id = parsed[1];

    if (!this.handlers[handler]) {
        return;
    }

    this.handlers[handler].splice(id, 1);
}

// Makes availabale to use cursor in any area
Canvas.prototype.enablePointerLock = function() {
    var canvas = this.canvas;

    // Check is last item in pointerLock equal to current canvas
    function isLocked() {
        return canvas === document.pointerLockElement ||
            canvas === document.mozPointerLockElement ||
            canvas === document.webkitPointerLockElement;
    }

    var exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock ||
        canvas.webkitRequestPointerLock;

    // Enable pointerLock on click
    canvas.addEventListener('click', function() {
        if (!isLocked()) {
            canvas.requestPointerLock();
        }
    });

    this.pointerLock = {
        isLocked: isLocked
    };
}

Canvas.prototype.fireEvent = function(handler, args) {
    if (!this.handlers[handler]) {
        return;
    }

    var array = this.handlers[handler];

    for (var i = 0; i < array.length; i++) {
        var handler = array[i];
        handler.apply(handler, args);
    }
}

Canvas.prototype.initialize = function() {
    var self = this;
    this.canvas.addEventListener('mousemove', event => {
        if (self.pointerLock) {
            if (self.pointerLock.isLocked()) {
                fireEvent([
                    event.movementX / RESOLUTION_WIDTH, -event.movementY / RESOLUTION_HEIGHT
                ]);
            }
        } else {
            fireEvent([event.pageX, event.pageY]);
        }
    });

    function fireEvent(data) {
        self.fireEvent('axis', [data]);
    }
}
