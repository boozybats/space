/**
 * Collects cameras, items and lights. Scene must be binded to the project
 * and defined as current scene to start action here.
 * @this {Scene}
 * @param {Object} options
 * @param {String} options.name
 * @param {Project} options.project
 * @param {Color} options.skyBoxColor
 * @param {String} options.skyBoxType
 * @class
 * @property {Number} lastShaderId The last used shader's id.
 * @property {Array} cameras
 * @property {Array} directionalLights
 * @property {Array} pointLights
 * @property {Array} items
 * @property {Array} systemitems Can be drawn separately from items.
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

		this.cameras_ = [];
		this.directionalLights_ = [];
		this.pointLights_ = [];
		this.items_ = [];
		this.systemitems_ = [];
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

	/**
	 * Appends camera to scene. All binded enabled cameras
	 * draw new WebGLContext view. To see all redrawed items
	 * set skyBoxType as transparent.
	 * @param  {Camera} camera
	 * @method
	 */
	appendCamera(camera) {
		if (!(camera instanceof Camera)) {
			throw new Error('Scene: appendCamera: must be a Camera');
		}

		this.cameras.push(camera);
		camera.scene_ = this;
	}

	/**
	 * Appends item to scene. Usualy function are
	 * called by {@link Item#instance}.
	 * @param  {Item} item
	 * @method
	 */
	appendItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: appendItem: must be an Item');
		}
		
		this.items.push(item);
		item.scene_ = this;
	}
 
	/**
	 * Appends system item to scene. Usualy function are
	 * called by {@link Item#instance}.
	 * @param  {Item} item
	 * @method
	 */
	appendSystemItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: appendSystemItem: must be an Item');
		}
		
		this.systemitems.push(item);
		item.scene_ = this;
	}

	/**
	 * Adds light of any type in scene, auto detection to class.
	 * @param {Light} light
	 * @method
	 */
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

	get cameras() {
		return this.cameras_;
	}

	get directionalLights() {
		return this.directionalLights_;
	}

	/**
	 * Returns finded item of scene by id, name (depending on
	 * "type") else returns undefined.
	 * @param {String} type id, name.
	 * @param  {Number | String} val
	 * @return {Item}
	 * @method
	 * @example
	 * var scene = new Scene();
	 *
	 * var item = new Item({id: 2031, ...});
	 * item.instance(scene);
	 *
	 * scene.findItem('id', 2031);  // Item {id: 2031, ...}
	 */
	findItem(type, val) {
		var items = this.items;

		switch (type) {
			case 'id':
			for (var item of items) {
				if (item.id === val) {
					return item;
				}
			}
			break;
		}
	}

	/**
	 * Returns an object with all lights of scene with calculated
	 * position, rotations, intensity, etc.
	 * @return {Object}
	 * @method
	 * @example
	 * var scene = new Scene();
	 * scene.getSceneLights();  // Object {pointLights: {position: ..., ambient: ...}, directionalLights: ...}
	 */
	getLights() {
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

	get items() {
		return this.items_;
	}

	get pointLights() {
		return this.pointLights_;
	}

	/**
	 * Removes item from scene's items or systemitems.
	 * @param  {item} item
	 * @method
	 */
	removeItem(item) {
		if (!(item instanceof Item)) {
			throw new Error('Scene: removeItem: must be an Item');
		}

		var ind = this.items.indexOf(item);
		if (ind >= 0) {
			this.items.splice(ind, 1);
		}
		else {
			var ind = this.systemitems.indexOf(item);

			if (ind >= 0) {
				this.systemitems.splice(ind, 1);
			}
		}
	}

	/**
	 * Removes light from scene's lights, auto detection to class.
	 * @param  {Light} light
	 * @method
	 */
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

	get systemitems() {
		return this.systemitems_;
	}
}
