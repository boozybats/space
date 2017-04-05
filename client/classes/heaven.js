const generator = require('./generator');
const Item      = require('./item');
const Body      = require('./body');
const Physic    = require('./physic');
const Matter    = require('./matter');

class Heaven extends Item {
	constructor() {
		super();
	}

	randomData(lvl) {
		this.physic = new Physic({
			matter: new Matter({
				Fe: generator.playerSize(lvl)
			})
		});

		this.body = new Body({
			position: new Vec3(...generator.playerPosition(lvl))
		});
	}
}

module.exports = Heaven;
