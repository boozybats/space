const Item = require('./item');

class Heaven extends Item {
	constructor({
		id
	}) {
		super({
			id
		});

		this.updateOldtime = Date.now();
	}

	/**
	 * Sets new body, physic
	 * @param  {Number} lvl Item's level
	 */
	generateData(lvl) {
		var volume = generator.playerVolume(lvl);
		this.physic = new Physic({
			matter: {
				Fe: volume
			}
		});

		var arr = generator.playerPosition(lvl);
		this.body = new Body({
			position: new Vec3(...arr)
		});
	}

	toJSON() {
		var json = super.toJSON();
		json.type = 'heaven';

		return json;
	}

	// updates heaven on server, is called by player
	uptodate(data, time) {
		if (typeof data !== 'object') {
			return;
		}
		else if (typeof time !== 'number') {
			return;
		}

		var changes = {};

		var o_time = this.updateOldtime,
			n_time = time;
		var delta = n_time - o_time;
		this.updateOldtime = n_time;

		if (typeof data.body === 'object') {
			var pos = data.body.position,
				rot = data.body.rotation,
				sca = data.body.scale;

			if (typeof pos !== 'object' ||
				typeof rot !== 'object' ||
				typeof sca !== 'object') {
				return;
			}

			changes.position = new Vec3(pos[0], pos[1], pos[2]);
			changes.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
			changes.scale = new Vec3(sca[0], sca[1], sca[2]);
		}

		this.verifyChanges(delta, changes);
	}

	/**
	 * Checks user's changes, if it possible then apply them
	 * @param  {Number} time How much time goes before last update
	 * @param  {Object} changes
	 */
	verifyChanges(time, {
		position,
		rotation
	}) {
		// check movement
	}
}

module.exports = Heaven;

const generator = require('../logic/generator');
const Body      = require('./body');
const Physic    = require('./physic');
const Vector    = require('./vector');
const Vec3      = Vector.Vec3;
