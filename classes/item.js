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

	/**
	 * Updates item data by sended data.
	 * @param  {Object} data
	 */
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
				var pos = body.position;
				this.body.position = new Vec3(pos[0], pos[1], pos[2]);
			}
			if (body.rotation instanceof Array) {
				var rot = body.rotation;
				this.body.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
			}
			if (body.scale instanceof Array) {
				var sca = body.scale;
				this.body.position = new Vec3(sca[0], sca[1], sca[2]);
			}
		}

		if (typeof data.physic === 'object') {
			if (!this.physic) {
				this.physic = new Physic;
			}

			var physic = data.physic;

			if (typeof physic.matter === 'object') {
				this.physic.initMatter(physic.matter);
			}
		}
	}
}

module.exports = Item;

const Body   = require('./body');
const Physic = require('./physic');
