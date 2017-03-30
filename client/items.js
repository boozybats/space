const ws_ = require('./ws');
const Body = require('./body');

const _storage = global.storages.items;

ws_.set('items', response => {
	var data = response.data,
		method = response.method;

	switch (method) {
		case 'getAll':
		if (!data) {
			return;
		}

		var out = [];
		var id = data.id;

		if (typeof id !== 'number') {
			response.answer({
				error: 'Must be selected "id"'
			});
		}

		_storage.each(item => {
			if (item.id !== id) {
				out.push(item.toJSON());
			}
		});

		response.answer({
			items: out
		});

		break;
	}
});

class Item {
	constructor({
		id,
		body
	} = {}) {
		this.id = id;
		this.body = body;
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
		if (!(val instanceof Body)) {
			this.body_ = new Body;
		}

		this.body_ = val;
	}
}
