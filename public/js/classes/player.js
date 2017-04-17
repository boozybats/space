/**
 * Player class needs to define player in game logic, it contains
 * heaven objects and dependencies.
 */

class Player {
	constructor({
		scene,
		cursor,
		camera
	} = {}) {
		if (!(scene instanceof Scene)) {
			throw new Error(`Player: "scene" must be a Scene, type: ${typeof scene}, value: ${scene}`);
		}
		else if (!(cursor instanceof Cursor)) {
			throw new Error(`Player: "cursor" must be a Cursor, type: ${typeof cursor}, value: ${cursor}`);
		}
		else if (!(camera instanceof Camera)) {
			throw new Error(`Player: "camera" must be a Camera, type: ${typeof camera}, value: ${camera}`);
		}

		var heaven = new Heaven({
			name: 'player',
			player: this,
			mouseControl: cursor
		});
		heaven.instance(scene);

		// make light source follows camera
		heaven.bindCamera(camera);

		this.actions_ = new Storage;

		// player contains items binded to him
		this.items = new Storage;
		this.items.set('heaven', heaven);
	}

	addAction(type, data) {
		var action = {
			type: type,
			data: data
		}
		this.actions.push(action);
	}

	get actions() {
		return this.actions_;
	}

	getActions() {
		var actions = this.actions.toArray();
		this.actions.clear();

		return actions;
	}

	getLastAction() {
		return this.actions[this.actions.length - 1];
	}

	get heaven() {
		return this.items.get('heaven');
	}

	/**
	 * Returns data of player's heaven object.
	 * @return {Object}
	 */
	toJSON() {
		var heaven = this.items.get('heaven');

		var json = heaven.toJSON();

		return json;
	}
}
