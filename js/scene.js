class Scene {
	constructor(name, project) {
		//scene needs to show interactive 3D animation

		this.name = name;
		this.project = project;
		this.cameras = [];             //array of scene's Camera
		this.directionalLight = [];   //array of directional lights
		this.pointLight = [];         //array of point lights
		this.items = [];      //array of scene's elements
		this.functionsonupdate = {};  //object of onupdate functions
	}

	appendCamera(camera) {
		if (!(camera instanceof Camera)) {
			console.warn('Scene: appendCamera: error');
		}

		this.cameras.push(camera);
	}

	appendElement(item) {
		if (!(item instanceof Item)) {
			console.warn('Scene: appendElement: error');
		}

		var renderer = this.project.webGLRenderer;

		//new clone element with parent element properties
		var n_item = new CloneItem(this, item);
		n_item.drawStyle = item.mesh.drawStyle;

		//if object must be drawn
		if (item.mesh) {
			n_item.setShader(item.mesh.shader);                     //initializes shader in program
			n_item.setAttributes(item.attributes);                  //initializes all attributes in buffers
			n_item.setVertexIndices(item.mesh.vertexIndicesArray);  //initializes vertex indices in buffer
			n_item.setTextures(item.mesh.textures);                 //textures of element to send in shader and get array of activity
			n_item.updateShaderUniforms(item.uniforms);             //updates uniforms at shader
		}
		this.items.push(n_item);  //pushes new element in array of scene's elements

		return n_item;
	}

	appendFunctionOnUpdate(name, fun) {
		if (typeof name !== "string") {
			console.warn('Scene: appendFunctionOnUpdate: name isn\'t a string');
		}
		else if (typeof fun != "function") {
			console.warn('Scene: appendFunctionOnUpdate: fun isn\'t a function');
		}

		//appendes the function which complete on requestFrame update

		this.functionsonupdate[name] = fun;
	}

	get camers() {
		return this.cameras_;
	}

	set cameras(val) {
		if (val instanceof Array) {
			this.cameras_ = val;
		}
		else {
			console.warn('Scene: cameras: error');
		}
	}

	createDirectionLight(body = new Body) {
		if (!(body instanceof Body)) {
			console.warn('Scene: createDirectionLight: error');
		}

		this.directionalLight.push(body);

		return body;
	}

	createPointLight(body = new Body) {
		if (!(body instanceof Body)) {
			console.warn('Scene: createPointLight: error');
		}

		this.pointLight.push(body);

		return body;
	}

	get directionalLight() {
		return this.directionalLight_;
	}

	set directionalLight(val) {
		if (val instanceof Array) {
			this.directionalLight_ = val;
		}
		else {
			console.warn('Scene: directionalLight: error');
		}
	}

	get functionsonupdate() {
		return this.functionsonupdate_;
	}

	set functionsonupdate(val) {
		if (typeof val === 'object') {
			this.functionsonupdate_ = val;
		}
		else {
			console.warn('Scene: functionsonupdate: error');
		}
	}

	get items() {
		return this.items_;
	}

	set items(val) {
		if (val instanceof Array) {
			this.items_ = val;
		}
		else {
			console.warn('Scene: items: error');
		}
	}

	get name() {
		return this.name_;
	}

	set name(val) {
		if (typeof val === 'string') {
			this.name_ = val;
		}
		else {
			console.warn('Scene: name: error');
		}
	}

	get pointLight() {
		return this.pointLight_;
	}

	set pointLight(val) {
		if (val instanceof Array) {
			this.pointLight_ = val;
		}
		else {
			console.warn('Scene: pointLight: error');
		}
	}

	get project() {
		return this.project_;
	}

	set project(val) {
		if (!val || val instanceof Project) {
			this.project_ = val;
		}
		else {
			console.warn('Scene: project: error');
		}
	}

	removeFunctionOnUpdate(name) {
		if (typeof name !== 'string') {
			console.warn("Scene: removeFunctionOnUpdate: error");
		}

		delete this.functionsonupdate[name];
	}

	get sceneLights() {
		var out = {};
		var directionalLight = this.directionalLight;
		var pointLight = this.pointLight;

		out.directionalLight = [];
		for (var light of directionalLight) {
			out.directionalLight.push(light.rotation.euler);
		}

		out.PointLight = [];
		for (var light of pointLight) {
			out.pointLight.push(pointLight.position);
		}

		return out;
	}

	startUpdateOfScene() {
		//updater of scene, redraws all scene at short time
		//intervals between update will be send at function arguments as a path of event

		var project = this.project;
		var canvas = project.canvas.domElement;
		var webglrenderer = project.webGLRenderer;

		//onupdate functions of scene
		var functions = this.functionsonupdate;

		//start time for delta time
		var startTime = new Date().getTime() / 1000;

		var self = this;
		(function update() {
			//break update on stop
			if (self.stopUpdate_) {
				self.stopUpdate_ = false;
				return;
			}

			var currentTime = new Date().getTime() / 1000;  //current time of updating
			var deltaTime = currentTime - startTime;      //delta of current and start times
			startTime = currentTime;  //update start time

			//run all onupdate functions
			for (var i in functions) {
				if (functions.hasOwnPropery(i)) {
					functions[i](deltaTime);
				}
			}

			webglrenderer.drawScene({deltaTime});  //draw scene function
			requestAnimationFrame(update, canvas);  //framework timer
		})();
	}

	stopUpdateOfScene() {
		this.stopUpdate_ = true;
	}
}
