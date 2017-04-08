const Body   = require('./body');
const Physic = require('./physic');

class Item {
	constructor({
		id,
		body,
		physic
	} = {}) {
		this.id = id;
		this.body = body;
		this.physic = physic;
	}

	get id() {
		return this.id_;
	}
	set id(val) {
		if (typeof val !== 'number') {
			this.id_ = -1;
		}

		this.id_ = val;
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (val && !(val instanceof Body)) {
			this.body_ = new Body;
		}

		this.body_ = val;
	}

	get physic() {
		return this.physic_;
	}
	set physic(val) {
		if (val && !(val instanceof Physic)) {
			this.physic_ = new Physic;
		}

		this.physic_ = val;
	}

	toJSON() {
		var out = {};

		if (this.body) {
			out.body = this.body.toJSON();
		}

		if (this.physic) {
			out.physic = this.physic.toJSON();
		}

		return out;
	}

	uptodate(data) {
		if (typeof data !== 'object') {
			return;
		}

		if (typeof data.body === 'object') {
			if (!this.body) {
				this.body = new Body;
			}

			var body = data.body;

			if (body.position instanceof Array) {
				this.body.position = new Vec3(...body.position);
			}
			if (body.rotation instanceof Array) {
				this.body.rotation = new Quaternion(...body.rotation);
			}
			if (body.scale instanceof Array) {
				this.body.position = new Vec3(...body.scale);
			}
		}

		if (typeof data.physic === 'object') {
			if (!this.physic) {
				this.physic = new Physic;
			}

			var physic = data.physic;

			if (typeof physic.matter === 'object') {
				this.physic.matter = physic.matter;
			}
		}
	}
}

module.exports = Item;
