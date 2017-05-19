const Action = {
	/**
	 * Verificate user action and sets it if it is a valid.
	 * @param {Object} options
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
			latency: latency,
			action: action
		});

		if (result) {
			this.set({
				item: item,
				action: action
			});
		}
	},
	/**
	 * Sets action to item, are used by execute after verification.
	 */
	set: function({
		item,
		action
	}) {
		switch (action.type) {
			case 'velocity':
			var vec = action.data;

			var velocity = new Vec3(vec[0], vec[1], vec[2]);
			if (item.rigidbody) {
				item.rigidbody.velocity = velocity;
			}
		}
	},
	/**
	 * Checks user's changes, if it possible then apply them.
	 */
	verify: function({
		item,
		latency,
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

			var data = action.data;
			if (typeof data !== 'object') {
				return false;
			}

			var value = data.value,
				duration = data.duration;

			if (!(value instanceof Array) || typeof duration !== 'number') {
				return false;
			}

			if (latency < duration) {
				return false;
			}

			var maxspeed = item.physic.maxspeed;
			var vec = new Vec3(value[0], value[1], value[2]);

			return vec.length() <= maxspeed * duration;

			break;
		}
	}
};

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
