class Project {
	constructor({
		transparentImage
	}) {
		this.scenes = [];
		this.layers = [];
		this.transparentImage = transparentImage;
	}

	addLayer(fun, index) {
		if (typeof fun !== 'function') {
			console.warn('Project: addLayer: error');
		}

		if (typeof index === 'number') {
			this.layers[index] = fun;
		}
		else {
			this.layers.push(fun);
		}
	}

	attachCanvas(canvas) {
		if (canvas.project) {
			console.warn('Project: attachCanvas: error');
		}

		this.canvas = canvas;
		canvas.project = this;
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

	createScene(name) {
		if (typeof name !== "string") {
			console.warn('Project: createNewScene: error');
		}

		var scene = new Scene({
			name,
			project: this
		});
		this.scenes.push(scene);

		return scene;
	}

	get currentScene() {
		return this.currentScene_;
	}

	set currentScene(val) {
		if (val instanceof Scene) {
			this.currentScene_ = val;
		}
		else {
			console.warn('WebGLRenderer: currentScene: error');
		}
	}

	detachCanvasElement() {
		if (this.canvas) {
			this.canvas.project = undefined;
			this.canvas = undefined;
		}
	}

	initializeWebGLRenderer() {
		if (!this.canvas) {
			console.warn('Project: initializeWebGLRenderer: error');
		}

		this.webGLRenderer = new WebGLRenderer({
			project: this
		});
		this.webGLRenderer.setup();
	}

	get layers() {
		return this.layers_;
	}

	set layers(val) {
		if (val instanceof Array) {
			this.layers_ = val;
		}
		else {
			console.warn('Project: layers: error');
		}
	}

	get scenes() {
		return this.scenes_;
	}

	set scenes(val) {
		if (val instanceof Array) {
			this.scenes_ = val;
		}
		else {
			console.warn('Project: scenes: error');
		}
	}

	start() {
		//updater of scene, redraws all scene at short time
		//intervals between update will be send at function arguments as a path of event

		var canvas = this.canvas.canvas;
		var webglrenderer = this.webGLRenderer;

		var functions = this.currentScene.functionsonupdate;
		var startTime = new Date().getTime() / 1000;

		var self = this;
		(function update() {
			if (self.stopUpdate_) {
				self.stopUpdate_ = false;
				return;
			}

			var currentTime = new Date().getTime() / 1000;
			var deltaTime = currentTime - startTime;
			startTime = currentTime;

			for (var i in functions) {
				if (functions.hasOwnPropery(i)) {
					functions[i]({deltaTime});
				}
			}

			webglrenderer.drawScene({
				currentTime,
				deltaTime
			});
			requestAnimationFrame(update, canvas);
		})();
	}

	stop() {
		this.stopUpdate_ = true;
	}

	selectScene(index) {
		if (typeof index === 'number') {
			this.currentScene = this.scenes[index];
		}
		else if (typeof index === 'string') {
			for (var scene of this.scenes) {
				if (scene.name === index) {
					this.currentScene = scene;
					break;
				}
			}
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
