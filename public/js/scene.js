class Scene {
	constructor(name, project) {
		this.name = name;
		this.project = project;
		this.cameras = [];
		this.directionalLights = [];
		this.pointLights = [];
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
			n_item.vertexIndices = item.mesh.vertexIndices;
			n_item.changeAttributes(item.mesh.attributes);
			n_item.changeUniforms(item.mesh.uniforms);
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

	addLight(light) {
		if (!(light instanceof Light)) {
			console.warn('Scene: addLight: error');
		}

		var constructor = light.constructor;
		switch(constructor) {
			case DirectionalLight:
			this.directionalLights.push(light);
			break;

			case PointLight:
			this.pointLights.push(light);
			break;
		}
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

	get directionalLights() {
		return this.directionalLights_;
	}

	set directionalLights(val) {
		if (val instanceof Array) {
			this.directionalLights_ = val;
		}
		else {
			console.warn('Scene: directionalLights: error');
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

	get lastShaderID() {
		return this.lastShaderID_;
	}

	set lastShaderID(val) {
		this.lastShaderID_ = val;
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

	get pointLights() {
		return this.pointLights_;
	}

	set pointLights(val) {
		if (val instanceof Array) {
			this.pointLights_ = val;
		}
		else {
			console.warn('Scene: pointLights: error');
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

	removeLight(light) {
		if (!(light instanceof Light)) {
			console.warn('Scene: removeLight: error');
		}

		var constructor = light.constructor;
		switch(constructor) {
			case DirectionalLight:
			this.directionalLights.split(this.directionalLights.indexOf(light), 1);
			break;

			case PointLight:
			this.pointLights.split(this.pointLights.indexOf(light), 1);
			break;
		}
	}

	get sceneLights() {
		var out = {};
		var directionalLights = this.directionalLights;
		var pointLights = this.pointLights;

		out.directionalLights = [];
		for (var light of directionalLights) {
			out.directionalLights.push(light.body.rotation.euler);
		}

		out.pointLights = [];
		for (var light of pointLights) {
			out.pointLights.push(light.body.position);
		}

		return out;
	}
}
