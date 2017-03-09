/**
 * Contains an info about cameras, items, skybox,
 * lights, e.t.c. 
 *
 * @constructor
 * @this {Scene}
 *  {number} this.lastShaderId The last used shader's id
 *  {Camera[]} this.cameras
 *  {DirectionalLight[]} this.directionalLights
 *  {PointLight[]} this.pointLights
 *  {Item[]} this.items
 *  {Item[]} this.systemitems Can be drawn separately from items
 * @param {string} name
 * @param {Project} project
 * @param {Color} skyBoxColor
 * @param {string} skyBoxType
 */

class Scene {
	constructor({
		name,
		project,
		skyBoxColor = new Color(0, 0, 0, 1),
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
		this.systemitems = [];
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			throw new Error('Scene: name: must be a string');
		}

		this.name_ = val;
	}

	get project() {
		return this.project_;
	}
	set project(val) {
		if (val && !(val instanceof Project)) {
			throw new Error('Scene: project: must be a Project');
		}

		this.project_ = val;
	}

	get skyBoxColor() {
		return this.skyBoxColor_;
	}
	set skyBoxColor(val) {
		if (!(val instanceof Color)) {
			throw new Error('Scene: skyBoxColor: must be a Color');
		}

		this.skyBoxColor_ = val;
	}

	get skyBoxType() {
		return this.skyBoxType_;
	}
	set skyBoxType(val) {
		if (typeof val !== 'string') {
			throw new Error('Scene: skyBoxType: must be a string');
		}

		this.skyBoxType_ = val;
	}

	appendCamera(camera) {
		if (!(camera instanceof Camera)) {
			throw new Error('Scene: appendCamera: must be a Camera');
		}

		this.cameras.push(camera);
		camera.scene = this;
	}

	appendItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: appendItem: must be an Item');
		}
		
		this.items.push(item);
	}
 
	appendSystemItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: appendSystemItem: must be an Item');
		}
		
		this.systemitems.push(item);
	}

	// adds any type of light in scene, auto detection to class
	addLight(light) {
		if (!(light instanceof Light)) {
			throw new Error('Scene: addLight: must be a Light');
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

	// find item by this id
	findItem(id) {
		var items = this.items;

		for (var item of items) {
			if (item.id === id) {
				return item;
			}
		}
	}

	/**
	 * Returns an object with all lights of scene with calculated
	 * position, rotations, intensity, e.t.c.
	 *
	 * @return {object}
	 *
	 * return example:
	 * {pointLights: {position: ..., ambient: ...}, directionalLights: ...}
	 */
	getSceneLights() {
		var out = [];

		var directionalLights = this.directionalLights;
		var pointLights = this.pointLights;

		for (var light of directionalLights) {
			out.push(light.data());
		}

		for (var light of pointLights) {
			out.push(light.data());
		}

		return out;
	}

	// just splices from items array
	removeItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: removeItem: must be an Item');
		}

		var ind = this.items.indexOf(item);
		if (ind >= 0) {
			this.items.splice(ind, 1);
		}
	}

	// auto detection to class
	removeLight(light) {
		if (!(light instanceof Light)) {
			throw new Error('Scene: removeLight: must be a Light');
		}

		var constructor = light.constructor;
		switch(constructor) {
			case DirectionalLight:
			var ind = this.directionalLights.indexOf(light);
			if (ind >= 0) {
				this.directionalLights.splice(ind, 1);
			}
			break;

			case PointLight:
			var ind = this.pointLights.indexOf(light);
			if (ind >= 0) {
				this.pointLights.splice(ind, 1);
			}
			break;
		}
	}
}
