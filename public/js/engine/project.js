/**
 * Collects all data and info about current action.
 * 
 * @constructor
 * @this {Project}
 *  {Canvas} this.canvas Drawning-element
 *  {WebGLRenderer} this.webGLRenderer WebGL component
 *  {Scene[]} this.scenes
 *  {Function[]} this.layers Layers are called every frame in order
 * @param {Image} transparentImage Default image that shows if
 *  sampler didn't load
 */

class Project {
	constructor({
		transparentImage
	}) {
		this.scenes = [];
		this.layers = [];
		this.transparentImage = transparentImage;
		/** @private */ this.oldtime = 0;

		this.requestAnimationFrame = this.requestAnimationFrame.bind(this);
	}

	/**
	 * Add layer-function to project, every layer-function executes
	 * every frame. All function runs reversely (in decreasing order
	 * ..., 2, 1, 0), this is necessary to add main function first
	 * and draw it the last one (the last layer is what see user)
	 *
	 * @param {Function} fun Executable function
	 * @param {number} index Index of function or can be a null
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
	 * and height, initializes WebGLRenderer
	 *
	 * @param {Canvas} canvas
	 */
	attachCanvas(canvas) {
		if (!(canvas instanceof Canvas)) {
			throw new Error('Project: attachCanvas: must be a Canvas');
		}

		this.canvas = canvas;
		canvas.project = this;

		this.viewportWidth = canvas.canvas.width;
		this.viewportHeight = canvas.canvas.height;

		this.webGLRenderer = new WebGLRenderer({
			project: this
		});
	}

	get canvas() {
		return this.canvas_;
	}
	set canvas(val) {
		if (!val || val instanceof Canvas) {
			this.canvas_ = val;
		}
		else {
			console.warn('Project: canvas: error');
		}
	}

	/**
	 * Fills scene with selected colors on canvas width and height.
	 * Possible types:
	 * 'fill' - fill area with selected color
	 * 'transparent' - fill area transparent black
	 *
	 * @param {string} skyBoxType
	 * @param {Color} skyBoxColor
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
	 *
	 * @param {string} name
	 * @param {bool} isCurrent
	 * @return {Scene}
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
	set currentScene(val) {
		if (!(val instanceof Scene) ||
			this.scenes.indexOf(val) === -1) {
			throw new Error('Project: currentScene: must be a scene created in current project');
		}

		this.currentScene_ = val;
	}

	detachCanvasElement() {
		if (this.canvas) {
			this.canvas.project = undefined;
			this.canvas = undefined;
		}
	}

	/**
	 * Adds a new main layer-function that draws items in a regular
	 * vision for user. Usual draws the last one. Goes through all
	 * cameras in scene and draws for each camera all scene's items,
	 * sends to items uniform a mvpmatrix, mvmatrix, lights, e.t.c,
	 * updates all attributes, uniforms and textures
	 *
	 * P.S. May be called once in code
	 */
	initialize() {
		var self = this;
		this.addLayer(function(options = {}) {
			var scene = self.currentScene,
				cameras = scene.cameras,
				sysitems = scene.systemitems,
				items = scene.items;

			for (var camera of cameras) {
				var cammvm = camera.mvmatrix(),
					campos4 = amc('*', new Vec4(0, 0, 0, 1), cammvm),
					campos3 = amc('/', campos4.xyz, campos4.w);

				var mvpmatrix = amc('*',
					Mat4.translate(campos3.inverse()),
					Mat4.translate(new Vec3(0, 0, -camera.deepOffset)),
					Mat4.rotate(camera.body.rotation.inverse()),
					Mat4.translate(new Vec3(0, 0, camera.deepOffset)),
					camera.projectionMatrix
				);

				for (var item of sysitems) {
					draw(item, mvpmatrix, options);
				}

				for (var item of items) {
					draw(item, mvpmatrix, options);
				}
			}
		});

		function draw(item, mvpmatrix, options) {
			var gl = self.webGLRenderer.webGL;
			var scene = self.currentScene;

			if (item.mesh) {
				var uniforms = {
					u_MVPMatrix: mvpmatrix
				};

				if (item.body) {
					var mvmatrix = item.mvmatrix();
					uniforms.u_MVMatrix = mvmatrix;
					uniforms.u_MVNMatrix = mvmatrix.normalize();
				}

				var lights = scene.getSceneLights();
				uniforms.u_Lights = lights;

				item.changeUniforms(uniforms);

				item.update();

				var VIOBuffer = item.mesh.VIOBuffer;
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);
				gl.drawElements(gl[item.mesh.drawStyle], VIOBuffer.length, gl.UNSIGNED_SHORT, 0);
			}

			if (typeof item.onupdate === 'function') {
				item.onupdate(options);
			}
		}
	}

	// updates function "update" of project by requestAnimationFrame-timer
	requestAnimationFrame() {
		var canvas = this.canvas.canvas;
		this.update();

		requestAnimationFrame(this.requestAnimationFrame, canvas);
	}

	/**
	 * Selects scene for currentScene of project
	 *
	 * @param {Scene} scene
	 */
	selectScene(scene) {
		if (!(scene instanceof Scene) ||
			this.scenes.indexOf(scene) === -1) {
			throw new Error('Project: selectScene: must be a Scene of this project');
		}

		this.currentScene = scene;
	}

	// updates all layer-functions and clears scene on each function
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

	set webGLRenderer(val) {
		if (val instanceof WebGLRenderer) {
			this.webGLRenderer_ = val;
		}
		else {
			console.warn('Project: webGLRenderer: error');
		}
	}
}
