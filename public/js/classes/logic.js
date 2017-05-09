class Logic {
	constructor(scene) {
		this.scene = scene;

		this.distribution = this.distribution.bind(this);
	}

	get scene() {
		return this.scene_;
	}
	set scene(val) {
		if (!(val instanceof Scene)) {
			throw new Error(`Logic: scene: must be a Scene, type: ${typeof val}, value: ${val}`);
		}

		this.scene_ = val;
	}

	/**
	 * Creates item by sended type and data from server.
	 * @param  {String} type
	 * @param  {Object} data
	 * @return {Item}
	 */
	createItem(type, data) {
		if (typeof type !== 'string' || typeof data !== 'object') {
			return;
		}

		var item;

		switch (type) {
			case 'heaven':
			item = new Heaven({
				id: data.id
			});
			item.instance(this.scene);
			item.receiveData(data);

			break;
		}

		return item;
	}

	/**
	 * Used by server distribution. Sends back to server data
	 * by callback-function.
	 * @param  {Object}   data     Data from server
	 * @param  {Function} callback Answer-function to server
	 */
	distribution(data, callback) {
		if (typeof data !== 'object') {
			return;
		}

		if (typeof data.items === 'object') {
			var items = data.items;
			this.updateItems(items);
		}

		if (typeof data.remove === 'object') {
			var array = data.remove;
			this.removeItems(array);
		}

		var wrap = {
			actions: player.getActions()
		}
		callback(wrap);
	}

	/**
	 * Receives id and item's data from server then starts project.
	 * @param  {Project} project
	 * @param  {Heaven} heaven  Player's heaven
	 */
	getData(project) {
		if (!(project instanceof Project)) {
			throw new Error(`Logic: getData: "project" must be a Project, type: ${typeof project}, value: ${project}, heaven: ${heaven}`);
		}

		// get player's item from global object
		var heaven = player.heaven;

		Server.player.defineId(id => {
			heaven.id = id;

			Server.heavens.getData(data => {
				heaven.receiveData(data);

				project.requestAnimationFrame();
			});
		});
	}

	removeItems(array) {
		if (!(array instanceof Array)) {
			return;
		}

		for (var i = 0; i < array.length; i++) {
			var id = array[i];
			var item = this.scene.findItem('id', id);

			if (item) {
				item.remove();
			}
		}
	}

	/**
	 * Callback function, is called from server request and creates new item
	 * or updates already existing (checking id).
	 */
	updateItems(data) {
		if (typeof data !== 'object') {
			return;
		}

		var scene = this.scene;
		var usedId = [];

		var time = new Date().getTime();
		
		// for every item
		for (var i = 0; i < data.length; i++) {
			var wrap = data[i];
			var id = wrap.id;

			usedId.push(id);

			// try find existing item on scene
			var item = scene.findItem('id', id);

			if (item) {
				item.receiveData(wrap, time);
				item.enabled = true;
			}
			else {
				this.createItem(wrap.type, wrap);
			}

			scene.disableUnusableItems(usedId);
		}
	}
}
