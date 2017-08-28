/**
 * Collects scenes and project properties. Must be created to start
 * WebGLRenderingContext drawning. Should be initialized for main layer.
 * @this {Project}
 * @param {Object} options
 * @class
 * @property {Array} scenes
 * @property {Array} layers Layers are called each frame in order.
 * @property {Canvas} canvas
 * @property {WebGLRenderer} webGLRenderer
 * @property {Scene} currentScene
 */
function Project() {
    this.scenes_ = [];
    this.layers_ = [];
}

Object.defineProperties(Project.prototype, {
    canvas: {
        get: function() {
            return this.canvas_;
        }
    },
    currentScene: {
        get: function() {
            return this.currentScene_;
        }
    },
    layers: {
        get: function() {
            return this.layers_;
        }
    },
    scenes: {
        get: function() {
            return this.scenes_;
        }
    },
    webGLRenderer: {
        get: function() {
            return this.webGLRenderer_;
        }
    }
});

/**
 * Adds layer-function to project, every layer-function executes
 * each frame. All function runs reversely (in decreasing order
 * ..., 2, 1, 0), this is necessary to add main function first
 * and draw last one (the last layer is what see user).
 * @param {Function} callback Executable function
 * @param {Number} index Index of function or can be a null
 * @method
 * @example
 * var project = new Project(options);
 * project.addLayer(callback, 'main');
 * project.layers;  // {main: function}
 */
Project.prototype.addLayer = function(callback, index) {
    if (typeof callback !== 'function') {
        warn('Project#addLayer', 'callback', callback);
        callback = function() {};
    }

    if (typeof index === 'number') {
        this.layers[index] = callback;
    } else {
        this.layers.push(callback);
    }
}

/**
 * Binds canvas to project and sets viewport width.
 * and height.
 * @param {Canvas} canvas
 * @method
 */
Project.prototype.attachCanvas = function(canvas) {
    if (!(canvas instanceof Canvas)) {
        error('Project#attachCanvas', 'canvas', canvas);
    }

    this.canvas_ = canvas;
    canvas.project_ = this;

    this.viewportWidth = canvas.canvas.width;
    this.viewportHeight = canvas.canvas.height;
}

// If shader doesn't exist then show warning
Project.prototype.checkInit = function(name) {
    if (this.webGLRenderer) {
        return true;
    } else {
        warnfree(`Project#${name}: webGLRenderer doesnt intialized for project, project: ${this}`);
        return false;
    }
}

/**
 * Fills scene with selected colors on canvas width and height.
 * Possible types:
 * 'fill' - fill area with selected color
 * 'transparent' - fill area transparent black
 * @param {String} skyBoxType
 * @param {Color} skyBoxColor
 * @method
 * @example
 * var project = new Project(options);
 * project.clearScene('fill', new Color(255, 100, 0, 1));
 */
Project.prototype.clearScene = function() {
    if (!this.checkInit('clearScene')) {
        return;
    }

    var renderer = this.webGLRenderer,
        gl = renderer.webGL,
        scene = this.currentScene;

    var skyBoxType = scene.skyBoxType,
        skyBoxColor = scene.skyBoxColor;

    switch (skyBoxType) {
        case 'fill':
            gl.clearColor(skyBoxColor.r, skyBoxColor.g, skyBoxColor.b, skyBoxColor.a);
            break;

        case 'transparent':
            gl.clearColor(0, 0, 0, 0);
            break;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Creates and returns a new scene this selected name,
 * choose as current if "isCurrent" = true
 * @param {String} name
 * @param {Boolean} isCurrent
 * @return {Scene}
 * @method
 */
Project.prototype.createScene = function(name = 'scene', isCurrent = false) {
    if (typeof name !== 'string') {
        warn('Project#createScene', 'name', name);
        name = 'scene';
    }

    var scene = new Scene({
        name: name,
        project: this
    });
    this.scenes.push(scene);

    if (isCurrent) {
        this.selectScene(scene);
    }

    return scene;
}

Project.prototype.defaultViewport = function() {
    if (!this.checkInit('defaultViewport')) {
        return;
    }

    var gl = this.webGLRenderer.webGL;

    gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
}

/**
 * Detaches canvas from project.
 * @method
 */
Project.prototype.detachCanvasElement = function() {
    if (this.canvas) {
        this.canvas.project = undefined;
        this.canvas = undefined;
    }
}

/**
 * Adds a new main layer-function that draws items in a regular
 * vision for user. Usual is drawed the last one. Goes through all
 * cameras in scene and draws for each camera all scene's items,
 * adds to items uniform a mvpmatrix, mvmatrix, lights, etc,
 * updates all attributes, uniforms and textures.
 * P.S. May be called once in code.
 * @method
 */
Project.prototype.initialize = function() {
    var self = this;
    this.addLayer(options => {
        var webGLRenderer = self.webGLRenderer,
            scene = self.currentScene;

        if (!scene || !webGLRenderer) {
            return;
        }

        var cameras = scene.cameras,
            items = scene.items.concat(scene.systemitems);

        webGLRenderer.renderer.start();

        self.clearScene();
        for (var i = 0; i < cameras.length; i++) {
            var camera = cameras[i];

            // Execute onupdate functions at first
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                if (!item.enabled) {
                    continue;
                }
                update(item, options);
            }

            // Initialze perspective matrix by camera body
            var mvpmatrix = camera.mvpmatrix();

            // Then draw items
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                if (!item.enabled) {
                    continue;
                }

                draw(item, mvpmatrix);
            }
        }

        webGLRenderer.renderer.end();
    });

    function update(item, options) {
        // update by custrom scripts
        item.streamUpdate(options);
    }

    function draw(item, mvpmatrix) {
        var gl = self.webGLRenderer.webGL;
        var scene = self.currentScene;

        var mesh = item.mesh;
        if (mesh) {
            var uniforms = {
                u_MVPMatrix: mvpmatrix
            };

            if (mesh.material) {
                uniforms.u_Material = mesh.material.data();
            }

            if (item.body) {
                var mvmatrix = item.body.mvmatrix();
                uniforms.u_MVMatrix = mvmatrix;
                uniforms.u_MVNMatrix = mvmatrix.normalize();
            }

            var lights = scene.getLights();
            uniforms.u_Lights = lights;

            var shader = item.mesh.shader;
            if (self.lastUsedShader !== shader) {
                self.lastUsedShader = shader;
                shader.useProgram();
            }

            mesh.changeUniforms(uniforms);

            mesh.update();

            var VIOBuffer = mesh.VIOBuffer;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);

            gl.drawElements(gl[mesh.drawStyle], VIOBuffer.size, gl.UNSIGNED_SHORT, 0);
        }
    }
}

/**
 * Initializes WebGLRenderer.
 * @param {Object} properties
 * @param {Object} properties.attributes
 * @param {Object} properties.webglattributes WebGLRendererContext attributes.
 */
Project.prototype.initializeWebGLRenderer = function(options = {}) {
    if (typeof options !== 'object') {
        warn('Project#initializeWebGLRenderer', 'options', options);
        options = {};
    }

    this.webGLRenderer_ = new WebGLRenderer({
        project: this,
        attributes: options.attributes,
        webglattributes: options.webglattributes
    });

    this.defaultViewport();
}

/**
 * updates function "update" of project by requestAnimationFrame-timer
 * @method
 */
Project.prototype.requestAnimationFrame = function() {
    var canvas = this.canvas.canvas;
    this.update();

    var self = this;
    requestAnimationFrame(function() {
        self.requestAnimationFrame();
    }, canvas);
}

/**
 * Selects scene as current scene in project.
 * @param {Scene} scene
 * @method
 */
Project.prototype.selectScene = function(scene) {
    if (!(scene instanceof Scene)) {
        warn('Project#selectScene', 'scene', scene);
        return;
    } else if (this.scenes.indexOf(scene) === -1) {
        warnfree(`Project#selectScene: scene not binded to project, scene: ${scene}, project: ${this}`);
        return;
    }

    this.currentScene_ = scene;
}

/**
 * Updates all layer-functions and clears scene on each function
 * @method
 */
Project.prototype.update = function() {
    var layers = this.layers;

    var olddate = this.olddate || Date.now(),
        newdate = Date.now(),
        delta = newdate - olddate;
    this.olddate = newdate;

    var options = {
        time: newdate,
        deltaTime: delta
    };

    for (var i = layers.length; i--;) {
        var layer = layers[i];
        layer(options);
    }
}
