class Item {
	constructor({
		id,
		body,
		physic
	} = {}) {
		this.id = id;
		this.body = body;
		this.physic = physic;

		this.onremove = function() {};
	}

	get id() {
		return this.id_;
	}
	set id(val) {
		if (typeof val !== 'number') {
			val = -1;
		}

		this.id_ = val;
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (val && !(val instanceof Body)) {
			val = new Body;
		}

		this.body_ = val;
	}

	get physic() {
		return this.physic_;
	}
	set physic(val) {
		if (val && !(val instanceof Physic)) {
			val = new Physic;
		}

		this.physic_ = val;
	}

	get onremove() {
		return this.onremove_;
	}
	set onremove(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onremove_ = val;
	}

	applyActions(latency, data) {
		if (typeof data !== 'object') {
			return;
		}

		for (var i = 0; i < data.length; i++) {
			var action = data[i];

			var result = this.verifyAction(action);
		}
	}

	// Just initializes "onremove"-function.
	remove() {
		this.onremove();
	}

	/**
	 * Converts available item's data to object and stringify it.
	 * @return {String} JSON
	 */
	toJSON(options = []) {
		if (typeof options !== 'object') {
			return {};
		}

		var out = {};

		out.id = this.id;

		if (~options.indexOf('body') && this.body) {
			out.body = this.body.toJSON();
		}

		if (~options.indexOf('physic') && this.physic) {
			out.physic = this.physic.toJSON();
		}

		return out;
	}

	/**
	 * Checks user's changes, if it possible then apply them
	 * @param  {Number} time How much time goes before last update
	 * @param  {Object} changes
	 */
	verifyAction(action) {
		if (typeof action !== 'object') {
			return false;
		}
		else if (!this.physic) {
			return false;
		}

		var type = action.type;

		switch (type) {
			case 'velocity':
			var vec = action.data;
			if (typeof vec !== 'object') {
				return false;
			}

			var maxspeed = this.physic.maxspeed;
			var shift = new Vec3(vec[0], vec[1], vec[2]);

			return verifyVelocity(shift, maxspeed);
		}
	}
}

function verifyVelocity(vec, maxspeed) {
	var distance = vec.length();
	return distance <= maxspeed;
}

module.exports = Item;

const Body   = require('./body');
const Physic = require('./physic');
const Vector     = require('./vector');
const Vec        = Vector.Vec;
const Vec2       = Vector.Vec2;
const Vec3       = Vector.Vec3;
const Vec4       = Vector.Vec4;
