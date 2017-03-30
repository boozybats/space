const ws_ = require('./ws');

const _storage = global.storages.players;

ws_.set('player', response => {
	var data = response.data,
		method = response.method;

	switch (method) {
		case 'getId':
		var id = GUID();

		var player = new Player({
			id: id,
			ip: response.ip
		});

		_storage.set(id, player);

		response.answer(id);

		break;

		case 'continueSession':
		if (!data) {
			return;
		}
		
		var id = data.id;

		response.answer(!!_storage.get(id));

		break;
	}
});

var GUIDs = [];
function GUID() {
	function path() {
		return parseInt((Math.random() * 9999999999).toFixed(0), 10);
	}
	var key = path();
	if (GUIDs.indexOf(key) === -1) {
		GUIDs.push(key);
		return key;
	}
	else {
		return GUID();
	}
}

class Player {
	constructor({
		id,
		ip
	} = {}) {
		this.id = id;
		this.ip = ip;
	}
}
