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

    this.width = width;
    this.height = height;
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
        // calls any functions with resize events to adapt canvas
        window.onresize();

        return true;
    } else {
        console.warn(`Warn: Canvas#appendTo: canvas can not be appended to element ${element}`);
        return false;
    }
}
