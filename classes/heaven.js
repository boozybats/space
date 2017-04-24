const Item = require('./item');

class Heaven extends Item {
	constructor({
		id
	}) {
		super({
			id: id
		});

		this.updateOldtime = Date.now();
	}

	/**
	 * Sets new body, physic
	 * @param  {Number} lvl Item's level
	 */
	generateNPCData(lvl) {
		var volume = generator.npcVolume(lvl);
		this.physic = new Physic({
			matter: new Matter({
				Fe: volume
			})
		});

		var arr = generator.position(lvl);
		this.body = new Body({
			position: new Vec3(...arr)
		});
	}

	/**
	 * Sets new body, physic
	 * @param  {Number} lvl Item's level
	 */
	generatePlayerData(lvl) {
		var volume = generator.playerVolume(lvl);
		this.physic = new Physic({
			matter: new Matter({
				Fe: volume
			})
		});

		var arr = generator.position(lvl);
		this.body = new Body({
			position: new Vec3(...arr)
		});
	}

	toJSON(options) {
		var json = super.toJSON(options);
		json.type = 'heaven';

		return json;
	}
}

module.exports = Heaven;

const generator  = require('../logic/generator');
const Body       = require('./body');
const Physic     = require('./physic');
const Matter     = require('./matter');
const Vector     = require('./vector');
const Vec3       = Vector.Vec3;
const Quaternion = require('./quaternion');
