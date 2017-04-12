const ws_    = require('../ws');
const Heaven = require('../classes/heaven');
const Player = require('../classes/player');

const _players = global.storages.players;
const _items   = global.storages.items;

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
		}

		response.answer(item.toJSON());

		break;
	}

	function instance(id) {
		var player = _players.get(id);
		if (!(player instanceof Player) || typeof player.items !== 'object') {
			return;
		}

		var heaven = new Heaven({
			id
		});
		player.items.set('heaven', heaven);

		heaven.generateData(0);
		heaven.onremove = function() {
			_items.remove(id);
		}

		_items.set(id, heaven);

		return heaven;
	}
});
