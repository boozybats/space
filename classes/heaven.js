const Item = require('./item');

class Heaven extends Item {
	constructor({
		id
	}) {
		super({
			id
		});
	}

	/**
	 * Sets new body, physic
	 * @param  {Number} lvl Item's level
	 */
	generateData(lvl) {
		this.physic = new Physic({
			matter: new Matter({
				Fe: generator.playerSize(lvl)
			})
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
}

module.exports = Heaven;

const generator = require('../logic/generator');
const Body      = require('./body');
const Physic    = require('./physic');
const Matter    = require('./matter');
const Vector    = require('./vector');
const Vec3      = Vector.Vec3;
