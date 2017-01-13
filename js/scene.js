class Scene {
	constructor(name, project) {
		this.name = name;
		this.project = project;
		this.cameras = [];
		this.directionalLight = [];
		this.pointLight = [];
		this.items = [];
		this.functionsonupdate = {};
	}

	appendCamera(camera) {
		if (!(camera instanceof Camera)) {
			console.warn('Scene: appendCamera: error');
		}

		this.cameras.push(camera);
	}

	appendItem(item) {
		if (!(item instanceof Item)) {
			console.warn('Scene: appendItem: error');
		}

		var renderer = this.project.webGLRenderer;

		var n_item = new CloneItem(this, item);
		n_item.drawStyle = item.mesh.drawStyle;

		if (item.mesh) {
			n_item.shader = item.mesh.shader;
			n_item.attributes = item.mesh.attributes;
			n_item.vertexIndices = item.mesh.vertexIndices;
			n_item.textures = item.mesh.textures;
			n_item.updateShaderUniforms(item.mesh.uniforms);
		}
		this.items.push(n_item);

		return n_item;
	}

	addFunctionOnUpdate(name, fun) {
		if (typeof name !== "string") {
			console.warn('Scene: appendFunctionOnUpdate: name isn\'t a string');
		}
		else if (typeof fun != "function") {
			console.warn('Scene: appendFunctionOnUpdate: fun isn\'t a function');
		}

		//appendes the function which complete on requestFrame update

		this.functionsonupdate[name] = fun;
	}

	get cameras() {
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
}
