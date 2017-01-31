class Scene {
	constructor({
		name,
		project,
		skyBoxColor = new Color(0, 0, 0, 255),
		skyBoxType = 'fill'
	}) {
		this.name = name;
		this.project = project;
		this.skyBoxColor = skyBoxColor;
		this.skyBoxType = skyBoxType;
		
		this.cameras = [];
		this.directionalLights = [];
		this.pointLights = [];
		this.items = [];
	}

	appendCamera(camera) {
		if (!(camera instanceof Camera)) {
			console.warn('Scene: appendCamera: error');
		}

		this.cameras.push(camera);
		camera.scene = this;
	}

	appendItem(item) {
		if (!(item instanceof Item)) {
			console.warn('Scene: appendItem: error');
		}
		
		this.items.push(item);
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

	get skyBoxColor() {
		return this.skyBoxColor_;
	}

	set skyBoxColor(val) {
		if (val instanceof Color) {
			this.skyBoxColor_ = val;
		}
		else {
			console.warn('Camera: skyBox: error');
		}
	}

	get skyBoxType() {
		return this.skyBoxType_;
	}

	set skyBoxType(val) {
		if (typeof val === 'string') {
			this.skyBoxType_ = val;
		}
		else {
			console.warn('Camera: skyBoxType: error');
		}
	}
}
