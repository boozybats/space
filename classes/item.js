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

	// Just initializes "onremove"-function.
	remove() {
		this.onremove();
	}

	/**
	 * Converts available item's data to object and stringify it.
	 * @return {String} JSON
	 */
	toJSON() {
		var out = {};

		out.id = this.id;

		if (this.body) {
			out.body = this.body.toJSON();
		}

		if (this.physic) {
			out.physic = this.physic.toJSON();
		}

		return out;
	}
}

module.exports = Item;

const Body   = require('./body');
const Physic = require('./physic');
