/**
 * Collects scenes and project properties. Must be created to start
 * WebGLContext drawning. Should be initialized for main layer.
 * @this {Project}
 * @param {Object} options
 * @param {Image} options.transparentImage Default image that shows if
 * sampler didn't load.
 * @class
 * @property {Array} scenes
 * @property {Array} layers Layers are called each frame in order.
 * @property {Image} transparentImage Default image that shows if
 * sampler didn't load.
 * @property {Canvas} canvas
 * @property {WebGLRenderer} webGLRenderer
 * @property {Scene} currentScene
 */

class Project {
	constructor({
		transparentImage
	}) {
		this.scenes_ = [];
		this.layers_ = [];
		this.transparentImage = transparentImage;

		/**
		 * @private
		 * @type {Number}
		 */
		this.oldtime = 0;
		this.requestAnimationFrame = this.requestAnimationFrame.bind(this);
	}

	/**
	 * Adds layer-function to project, every layer-function executes
	 * each frame. All function runs reversely (in decreasing order
	 * ..., 2, 1, 0), this is necessary to add main function first
	 * and draw last one (the last layer is what see user).
	 * @param {Function} fun Executable function
	 * @param {Number} index Index of function or can be a null
	 * @method
	 * @example
	 * var project = new Project(options);
	 * project.addLayer(callback, 'main');
	 * project.layers;  // {main: function}
	 */
	addLayer(fun, index) {
		if (typeof fun !== 'function') {
			throw new Error('Project: addLayer: must be a function');
		}

		if (typeof index === 'number') {
			this.layers[index] = fun;
		}
		else {
			this.layers.push(fun);
		}
	}

	/**
	 * Binds canvas to project and sets viewport width
	 * and height, initializes WebGLRenderer.
	 * @param {Canvas} canvas
	 * @method
	 */
	attachCanvas(canvas) {
		if (!(canvas instanceof Canvas)) {
			throw new Error('Project: attachCanvas: must be a Canvas');
		}

		this.canvas_ = canvas;
		canvas.project_ = this;

		this.viewportWidth = canvas.canvas.width;
		this.viewportHeight = canvas.canvas.height;

		this.webGLRenderer_ = new WebGLRenderer({
			project: this
		});
	}

	get canvas() {
		return this.canvas_;
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
	clearScene(skyBoxType, skyBoxColor) {
		var renderer = this.webGLRenderer,
			gl = renderer.webGL;

		switch(skyBoxType) {
			case 'fill':
			gl.clearColor(...skyBoxColor.array());
			break;

			case 'transparent':
			gl.clearColor(0, 0, 0, 0);
			break;
		}

		gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
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
	createScene(name, isCurrent = false) {
		if (typeof name !== 'string') {
			throw new Error('Project: createNewScene: "name" must be a string');
		}

		var scene = new Scene({
			name,
			project: this
		});
		this.scenes.push(scene);

		if (isCurrent) {
			this.selectScene(scene);
		}

		return scene;
	}

	get currentScene() {
		return this.currentScene_;
	}

	/**
	 * Detaches canvas from project.
	 * @method
	 */
	detachCanvasElement() {
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
	initialize() {
		var self = this;
		this.addLayer(function(options = {}) {
			var scene = self.currentScene,
				cameras = scene.cameras,
				sysitems = scene.systemitems,
				items = scene.items;

			for (var camera of cameras) {
				var mvpmatrix = camera.mvpmatrix();
				// console.log(amc('*', mvpmatrix, new Vec4(-1, -1, -1, 1)).tocartesian());

				var allitems = items.concat(sysitems);
				for (var item of allitems) {
					draw(item, mvpmatrix, options);
				}
			}
		});

		function draw(item, mvpmatrix, options) {
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
					var mvmatrix = item.mvmatrix();
					uniforms.u_MVMatrix = mvmatrix;
					uniforms.u_MVNMatrix = mvmatrix.normalize();
				}

				var lights = scene.getSceneLights();
				uniforms.u_Lights = lights;

				item.changeUniforms(uniforms);

				item.update();

				var VIOBuffer = mesh.VIOBuffer;
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);

				gl.drawElements(gl[mesh.drawStyle], VIOBuffer.length, gl.UNSIGNED_SHORT, 0);
			}

			if (typeof item.onupdate === 'function') {
				item.onupdate(options);
			}
		}
	}

	get layers() {
		return this.layers_;
	}

	/**
	 * updates function "update" of project by requestAnimationFrame-timer
	 * @method
	 */
	requestAnimationFrame() {
		var canvas = this.canvas.canvas;
		this.update();

		requestAnimationFrame(this.requestAnimationFrame, canvas);
	}

	get scenes() {
		return this.scenes_;
	}

	/**
	 * Selects scene as current scene in project.
	 * @param {Scene} scene
	 * @method
	 */
	selectScene(scene) {
		if (!(scene instanceof Scene) ||
			this.scenes.indexOf(scene) === -1) {
			throw new Error('Project: selectScene: must be a Scene of this project');
		}

		this.currentScene_ = scene;
	}

	/**
	 * Updates all layer-functions and clears scene on each function
	 * @method
	 */
	update() {
		var layers = this.layers;
		var scene = this.currentScene;

		var olddate = this.olddate || new Date().getTime(),
			newdate = new Date().getTime(),
			deltaTime = newdate - olddate;
		this.olddate = newdate;

		for (var i = layers.length - 1; i >= 0; i--) {
			this.clearScene(scene.skyBoxType, scene.skyBoxColor);

			var layer = layers[i];
			layer({deltaTime});
		}
	}

	get webGLRenderer() {
		return this.webGLRenderer_;
	}
}
