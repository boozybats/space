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

		var arr = generator.playerPosition(lvl);
		console.log(typeof (new Body));
		this.body = new Body({
			position: new Vec3(...arr)
		});
	}
}

module.exports = Heaven;
