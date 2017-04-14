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
			me: true,
			mouseControl: cursor
		});
		heaven.instance(scene);

		// make light source follows camera
		heaven.bindCamera(camera);

		// player contains items binded to him
		this.items = new Storage;
		this.items.set('heaven', heaven);
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
