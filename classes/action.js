const Action = {
	/**
	 * Verificate user action and sets it if it is a valid.
	 * @param {Opbject} options
	 * @param  {Item} options.item
	 * @param  {Number} options.latency Latency between callbacks of distribution.
	 * @param  {Object} options.action
	 */
	execute: function({
		item,
		latency,
		action
	} = {}) {
		if (typeof action !== 'object') {
			return;
		}

		var result = this.verify({
			item: item,
			action: action
		});

		if (result) {
			this.set({
				item: item,
				latency: latency,
				action: action
			});
		}
	},
	/**
	 * Sets action to item, are used bu execute after verification.
	 */
	set: function({
		item,
		latency,
		action
	}) {
		switch (action.type) {
			case 'velocity':
			var vec = action.data;

			var velocity = new Vec3(vec[0], vec[1], vec[2]);
			var shift = amc('*', velocity, latency / 1000);

			item.body.position = amc('+', item.body.position, shift);
		}
	},
	/**
	 * Checks user's changes, if it possible then apply them.
	 */
	verify: function({
		item,
		action
	}) {
		if (typeof action !== 'object') {
			return false;
		}

		switch (action.type) {
			case 'velocity':
			if (!item.physic) {
				return false;
			}

			var vec = action.data;
			if (typeof vec !== 'object') {
				return false;
			}

			var maxspeed = item.physic.maxspeed;
			var velocity = new Vec3(vec[0], vec[1], vec[2]);

			return verifyVelocity(velocity, maxspeed);
		}

	}
};

function verifyVelocity(vec, maxspeed) {
	var distance = vec.length();
	return distance <= maxspeed;
}

module.exports = Action;

const math       = require('./math');
const amc        = math.amc;
const Body       = require('./body');
const Physic     = require('./physic');
const Vector     = require('./vector');
const Vec        = Vector.Vec;
const Vec2       = Vector.Vec2;
const Vec3       = Vector.Vec3;
const Vec4       = Vector.Vec4;
