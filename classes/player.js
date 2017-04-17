class Player {
	constructor({
		id
	} = {}) {
		this.id = id;

		this.items_ = new Storage;
		this.onremove = function() {};
	}

	get id() {
		this.id_;
	}
	set id(val) {
		if (typeof val !== 'number') {
			val = -1;
		}

		this.id_ = val;
	}

	get client() {
		return this.client_;
	}
	set client(val) {
		if (!val || val instanceof Client) {
			this.client_ = val;
		}
	}

	get heaven() {
		return this.items.get('heaven');
	}
	set heaven(val) {
		if (!(val instanceof Heaven)) {
			val = new Heaven;
		}

		this.items.set('heaven', val);
	}

	get items() {
		return this.items_;
	}

	get lastActionsUpdate() {
		return this.lastActionsUpdate_;
	}
	set lastActionsUpdate(val) {
		if (typeof val !== 'number') {
			val = Date.now();
		}

		this.lastActionsUpdate_ = val;
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

	remove() {
		this.onremove();

		var heaven = this.items.get('heaven');
		if (heaven) {
			heaven.remove();
		}
	}

	// Calls client's send-function
	send(options) {
		if (!this.client) {
			return;
		}

		this.client.send(options);
	}
}

module.exports = Player;

const Storage  = require('./storage');
const Client   = require('./client');
const Heaven   = require('./heaven');
