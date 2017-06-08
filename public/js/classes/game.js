// Creates project, webGlRenderer and gives many helpful options
function Game(options = {}) {
    if (typeof options !== 'object') {
        warn('Game', 'options', options);
        options = {};
    }

    this.clientId_ = undefined;
    this.player_ = {};

    this.dependencies = {};
    this.thrownDependecies = {};
    this.dependenciesLoadCount = 0;

    this.handlers = {
        loaded: [],
        throw: [],
        ready: [],
        connected: [],
        started: []
    };

    this.isInitialized = false;
    this.isStarted = false;
    this.statusDepndecies = 'ready';
    this.statusConnection = 'ready';

    this.defineSystemSettings();
}

Object.defineProperties(Game.prototype, {
    canvas: {
        get: function() {
            return this.canvas_;
        }
    },
    clientId: {
        get: function() {
            return this.clientId_;
        }
    },
    connection: {
        get: function() {
            return this.connection_;
        }
    },
    player: {
        get: function() {
            return this.player_;
        }
    },
    project: {
        get: function() {
            return this.project_;
        }
    },
    scene: {
        get: function() {
            return this.scene_;
        }
    },
    shaders: {
        get: function() {
            return this.shaders_;
        }
    }
});

Game.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        warn('Game#attachEvent', 'callback', callback);
        return;
    }
    if (!this.handlers[handler]) {
        warnfree(`Game#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    var index = `${handler}_${this.handlers[handler].push(callback) - 1}`;

    return index;
}

Game.prototype.bindAxisToPlayer = function() {
    if (!(this.isStarted)) {
        warnfree('Game#bindAxisToPlayer: game must be started');
        return;
    }

    var canvas = this.canvas;
    var item = this.player.item;

    canvas.attachEvent('axis', function(arr) {
        var maxspeed = item.physic.maxspeed;
        var vec = new Vec3(arr[0] * maxspeed, arr[1] * maxspeed, 0);
        var dir = amc('+', item.rigidbody.velocity, vec);

        var length = dir.length();
        if (length > maxspeed) {
            dir = amc('*', dir.normalize(), maxspeed);
        }

        item.rigidbody.velocity = dir;
    });
}

Game.prototype.configureConnection = function() {
    var self = this;

    this.defineId(id => {
        self.clientId_ = id;
    });

    this.setConnectionListeners({
        client: this.requestClient,
        player: this.requestPlayer
    });
}

Game.prototype.connectToServer = function(options = {}) {
    var socket = options.socket;

    var connection = new Connection(socket);
    var self = this;
    connection.onready = function() {
        self.fireEvent('connected');
    }

    this.connection_ = connection;

    this.configureConnection();
}

Game.prototype.defineId = function(callback) {
    var self = this;
    var connection = this.connection;

    var id = cookie.read('id');

    if (typeof id === 'number') {
        continueSession(id, response => {
            if (response.data) {
                callback(id);
            } else {
                cookie.remove('id');
                self.defineId(callback);
            }
        });
    } else {
        getId(response => {
            var id = response.data;

            cookie.set('id', id);

            callback(id);
        });
    }

    function continueSession(id, callback) {
        connection.send('player', {
            method: 'continueSession',
            id: id
        }, callback);
    }

    function getId(callback) {
        connection.send('player', {
            method: 'getId'
        }, callback);
    }
}

Game.prototype.defineSystemSettings = function() {
    // Define request animation frame
    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.webkitRequestAnimationFrame;
}

Game.prototype.detachEvent = function(index) {
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

Game.prototype.fireEvent = function(handler, args = []) {
    if (!this.handlers[handler]) {
        warn(`Game#fireEvent: handler isnt defined, handler: ${handler}`);
        return;
    }
    if (!(args instanceof Array)) {
        warn('Game#fireEvent', 'args', args);
        return;
    }

    var array = this.handlers[handler];

    for (var i = 0; i < array.length; i++) {
        var handler = array[i];
        if (typeof handler === 'function') {
            handler.apply(handler, args);
        }
    }
}

/**
 * Instances canvas, project and initializes them
 * @param {Object} options
 * @param {Object} options.canvas
 * @param {Number} options.canvas.width
 * @param {Number} options.canvas height
 * @param {DOMElement} options.canvas.dom
 * @param {Object} options.graphic
 * @param {String} options.graphic.antialias
 */
Game.prototype.initialize = function(options = {}) {
    if (typeof options !== 'object') {
        warn('Game#initialize', 'options', options);
        options = {};
    }

    // Canvas attributes
    var canvasOpt = options.canvas;
    if (typeof canvasOpt !== 'object') {
        error('Game#initialize', 'options.canvas', canvasOpt);
    }

    // Attributes for webGLRenderer
    var graphicOpt = options.graphic;
    if (typeof graphicOpt !== 'object') {
        graphicOpt = {};
    }

    // Create canvas and define resoultion by attributes
    var canvas = new Canvas(
        canvasOpt.width || RESOLUTION_WIDTH,
        canvasOpt.height || RESOLUTION_HEIGHT
    );
    this.canvas_ = canvas;

    // Append canvas to selected dom element
    canvas.appendTo(canvasOpt.dom);

    // Bind canvas to pointerLock
    canvas.enablePointerLock();

    // Make canvas flexible
    this.optimizeCanvas();

    // Create project
    var project = new Project;

    // Bind canvas to created project
    project.attachCanvas(canvas);

    // Set first layer for webGL drawning in project
    project.initialize();

    // Initialize webGLRenderer by attributes
    project.initializeWebGLRenderer({
        attributes: {
            antialias: graphicOpt.antialias || 'FXAAx2'
        }
    });

    this.canvas_ = canvas;
    this.project_ = project;
    this.isInitialized = true;
}

Game.prototype.initializeShaders = function() {
    if (!this.isInitialized) {
        warnfree('Game#initializeShaders: webGlRenderer isnt initialized');
        return;
    }

    var dependencies = this.dependencies;
    var shaders = new Shaders(this.project.webGLRenderer.webGL);
    this.shaders_ = shaders;

    var options = {
        transparentImage: dependencies.transparentImage
    };

    shaders.add('heaven', Heaven.shader(), options);
    shaders.add('facebox', Facebox.shader());
}

Game.prototype.onDistribution = function(data) {
    if (typeof data !== 'object') {
        return;
    }

    if (typeof data.items === 'object') {
        var items = data.items;
        this.updateItems(items);
    }

    if (typeof data.remove === 'object') {
        var array = data.remove;
        this.removeItems(array);
    }

    // Trigger and collect all actions
    player.heaven.rigidbody.tug();
    var wrap = {
        actions: player.getActions()
    }
    player.clearActions();
    callback(wrap);
}

// Make flexible canvas by window
Game.prototype.optimizeCanvas = function() {
    if (!(this.canvas instanceof Canvas)) {
        warn('Game#optimizeCanvas', 'this.canvas', this.canvas);
        return;
    }

    var canvas = this.canvas.canvas;

    var cssheight, csswidth;

    function onresize() {
        var parent = canvas.parentNode;
        if (parent) {
            var ratio = RESOLUTION_WIDTH / RESOLUTION_HEIGHT

            var win = {
                w: parent.offsetWidth,
                h: parent.offsetHeight
            };

            if (win.w / ratio > win.h) {
                canvas.style.height = '100%';
                var height = cssheight = canvas.offsetHeight;
                var width = csswidth = height * ratio;
                canvas.style.width = width + 'px';
                canvas.style.marginLeft = (win.w - width) / 2 + 'px';
                canvas.style.marginTop = 0;
            } else {
                canvas.style.width = '100%';
                var width = csswidth = canvas.offsetWidth;
                var height = cssheight = width / ratio;
                canvas.style.height = height + 'px';
                canvas.style.marginLeft = 0;
                canvas.style.marginTop = (win.h - height) / 2 + 'px';
            }
        }
    }
    window.onresize = onresize;
    // calls any functions with resize events to adapt canvas
    window.onresize();
}

Game.prototype.requestClient = function(response) {
    if (typeof response !== 'object') {
        warn('Game#requestClient', 'response', response);
        return;
    }

    var data = response.data;

    if (typeof data !== 'object') {
        return;
    }

    var method = data.method;

    switch (method) {
        case 'connectionTest':
            response.answer();
            break;

        case 'distribution':
            this.onDistribution(data, response.answer);
            break;
    }
}

Game.prototype.requestPlayer = function(response) {
    if (typeof response !== 'object') {
        warn('Game#requestClient', 'response', response);
        return;
    }

    var data = response.data;

    if (typeof data !== 'object') {
        return;
    }

    var method = data.method;

    switch (method) {}
}

// Sets all dependencies in array
Game.prototype.setDependencies = function(dependencies = []) {
    if (!(dependencies instanceof Array)) {
        warn('Game#setDependencies', 'dependencies', dependencies);
        return;
    }

    for (var i = 0; i < dependencies.length; i++) {
        var dependency = dependencies[i];

        this.setDependency(dependency);
    }
}

/**
 * Depndency view:
 * {
 *   type: 'image',
 *   name: 'background',
 *   src: './images/background.png'
 * }
 */
Game.prototype.setDependency = function(dependency) {
    if (typeof dependency !== 'object' || !dependency.name) {
        warn('Game#setDependency', 'dependency', dependency);
        return;
    }

    var self = this;
    var name = dependency.name;

    switch (dependency.type) {
        case 'image':
        case 'img':
        case 'picture':
            var image = new Image();

            image.onload = function() {
                self.dependencies[name] = image;
                oncomplete();
                self.fireEvent('loaded', [image]);
            }
            image.onerror = function() {
                self.thrownDependecies[name] = dependency;
                oncomplete();
                self.fireEvent('throw', [dependency]);
            }

            image.src = dependency.src;

            break;

        default:
            return;
    }

    this.dependenciesLoadCount++;
    this.statusDepndecies = 'load';

    function oncomplete() {
        self.dependenciesLoadCount--;

        if (self.dependenciesLoadCount <= 0) {
            this.statusDepndecies = 'ready';
            self.fireEvent('ready', [self.dependencies, self.thrownDependecies]);
        }
    }
}

Game.prototype.setConnectionListeners = function(options) {
    if (typeof options !== 'object') {
        warn('Game#setConnectionListeners', 'options', options);
        return;
    }

    var connection = this.connection;

    for (var i in options) {
        if (!options.hasOwnProperty(i)) {
            continue;
        }

        var callback = options[i];

        if (typeof callback !== 'function') {
            warn('Game#setConnectionListeners', `callback ${i}`, callback);
            continue;
        }

        connection.listen(i, callback);
    }
}

// Creates scene, camera, player's objects and starts rendering
Game.prototype.start = function() {
    if (this.isStarted) {
        warnfree('Game#start: already started');
        return;
    }
    if (!this.isInitialized) {
        warnfree('Game#start: can not be started, because not initialized');
        return;
    }

    // Check on dependencies and connection status
    var isReady = this.statusDepndecies == 'ready',
        isConnected = this.statusConnection == 'ready';

    // If something needs to be initialized then wait it
    if (isReady && isConnected) {
        completed();
    } else {
        /* If something wasn't initialized yet and was initialized
        at start of function then ignores it */
        if (!isReady) {
            this.attachEvent('ready', function() {
                isReady = true;
                completed();
            });
        }
        if (!isConnected) {
            this.attachEvent('connected', function() {
                isConnected = true;
                completed();
            });
        }
    }

    var self = this;

    function completed() {
        if (self.isStarted) {
            return;
        }
        if (!isReady || !isConnected) {
            return;
        }

        self.isStarted = true;

        self.initializeShaders();

        var project = self.project;
        var scene = project.createScene('main', true);
        var camera = new Camera;
        scene.appendCamera(camera);

        var shaders = self.shaders;

        // Create player item
        var item = new Heaven({
            shader: shaders.get('heaven')
        });
        item.instance(scene);
        self.player.item = item;

        // Bind camera to watch on player's item
        item.observer = camera;

        // Binds cursor movement to player's controll
        self.bindAxisToPlayer();

        // Create facebox and select player's item as controller
        var facebox = new Facebox({
            controller: item,
            shader: shaders.get('facebox')
        });
        facebox.instance(scene, true);
        self.player.facebox = facebox;

        // Start project updating
        project.requestAnimationFrame();

        self.fireEvent('started', [scene, camera]);
    }
}
