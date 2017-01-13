class Project {
	constructor() {
		//start work with engine from creation class Project
		this.scenesArray = [];  //project's scenes
		this.redraws = [];      //each function of redraw array is calling on every update
	}

	addRedrawFunction(index, fun, callback) {
		if (typeof index != 'number') {
			console.warn('Project: addRedrawFunction: index isn\'t a number');
		}
		else if (typeof fun != "function") {
			console.warn('Project: addRedrawFunction: fun isn\'t a function');
		}
		else if (callback && typeof callback != "function") {
			console.warn('Project: addRedrawFunction: callback isn\'t a function');
		}

		//adds new redraw function
		//if haven't index - pushes to array
		//after drawning of all elements calls callback function

		var functionsArray = [fun, callback];
		if (index) {
			this.redraws[index] = functionsArray;
		}
		else {
			this.redraws.push(functionsArray);
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
			this.canvas = val;
		}
		else {
			console.warn('Project: canvas: error');
		}
	}

	createNewScene(name) {
		if (typeof name !== "string") {
			console.warn('Project: createNewScene: error');
		}

		var scene = new Scene(name, this);
		this.scenesArray.push(scene);

		return scene;
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

		this.webGLRenderer = new WebGLRenderer(this);
		this.webGLRenderer.setup();
	}

	get redraws() {
		return this.redraws_;
	}

	set redraws(val) {
		if (val instanceof Array) {
			this.redraws_ = val;
		}
		else {
			console.warn('Project: redraws: error');
		}
	}

	get scenesArray() {
		return this.scenesArray_;
	}

	set scenesArray(val) {
		if (val instanceof Array) {
			this.scenesArray_ = val;
		}
		else {
			console.warn('Project: scenesArray: error');
		}
	}

	selectScene(index) {
		if (typeof index !== "number") {
			console.warn('Project: selectScene: error');
		}

		//selects scene in project to work with it

		this.webGLRenderer.currentScene = this.scenesArray[index];
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
