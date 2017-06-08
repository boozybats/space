const ws_  = require('../ws');
const Item = require('../../classes/item');

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
	}
});
