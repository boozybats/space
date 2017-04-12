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

	get items() {
		return this.items_;
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
		if (heaven instanceof Heaven) {
			heaven.remove();
		}
	}

	// Calls client's send-function
	send({
		handler,
		data,
		callback
	}) {
		if (!this.client) {
			return;
		}

		this.client.send({
			handler: handler,
			data: data,
			callback: callback
		});
	}
}

module.exports = Player;

const Storage  = require('./storage');
const Heaven   = require('./heaven');
const Client   = require('./client');
