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
		case 'instance':
		var heaven = new Heaven;
		heaven.randomData(0);

		_items.set(id, heaven);

		response.answer(heaven.toJSON());

		break;
	}
});
