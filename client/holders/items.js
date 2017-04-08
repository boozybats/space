const ws_  = require('../ws');
const Item = require('../classes/item');

const _items = global.storages.items;

ws_.set('items', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}
	
	var id = data.id;
	var method = data.method;

	if (!global.verification(id, response.ip)) {
		return;
	}

	switch (method) {
		case 'getAll':
		var out = [];
		var id = data.id;

		_items.each(item => {
			if (item.id !== id) {
				out.push(item.toJSON());
			}
		});

		response.answer(out);

		break;

		case 'setData':
		var id = data.id

		var item = _items.find(function(item) {
			if (item.id === id) {
				return true;
			}
		})[0];

		if (item) {
			item.uptodate(data.item);
		}

		break;
	}
});
