const ws_    = require('../ws');
const Heaven = require('../classes/heaven');

const _items = global.storages.items;

ws_.set('heavens', response => {
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
		case 'getData':
		var item = _items.get(id);

		if (!item) {
			item = instance(id);
			_items.set(id, item);
		}

		response.answer(item.toJSON());

		break;
	}

	function instance() {
		var heaven = new Heaven;
		heaven.generateData(0);

		return heaven;
	}
});
