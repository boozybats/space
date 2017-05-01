class Item {
	constructor({
		id,
		body,
		physic,
		rigidbody
	} = {}) {
		this.id = id;
		this.body = body;
		this.physic = physic;
		this.rigidbody = rigidbody;

		this.onremove = function() {};
		this.onupdate = function() {};
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

	get rigidbody() {
		return this.rigidbody_;
	}
	set rigidbody(val) {
		if (val && !(val instanceof Rigidbody)) {
			val = new Rigidbody;
		}

		this.rigidbody_ = val;
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

	get onupdate() {
		return this.onupdate_;
	}
	set onupdate(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onupdate_ = val;
	}

	// Send actions list to Action and applies for item
	applyActions(latency, data) {
		if (typeof data !== 'object') {
			return;
		}

		for (var i = 0; i < data.length; i++) {
			var action = data[i];
			Action.execute({
				item: this,
				latency: latency,
				action: action
			});
		}
	}

	// Executes all "onupdate"-functions for item (physic, rigidbody, etc)
	frameupdate(options) {
		this.onupdate(options);
		if (this.physic) {
			this.physic.onupdate(options);
		}
		if (this.rigidbody) {
			this.rigidbody.onupdate(options);
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
}

module.exports = Item;

const Body       = require('./body');
const Physic     = require('./physic');
const Rigidbody  = require('./rigidbody');
const Action     = require('./action');
