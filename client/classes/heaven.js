const Item = require('./item');

class Heaven extends Item {
	constructor() {
		super();
	}

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
}

module.exports = Heaven;

const generator = require('./generator');
const Body      = require('./body');
const Physic    = require('./physic');
const Matter    = require('./matter');
const Vector    = require('./vector');
const Vec3      = Vector.Vec3;
