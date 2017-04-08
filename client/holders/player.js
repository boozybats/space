const ws_    = require('../ws');
const Player = require('../classes/player');

const _players = global.storages.players;

ws_.set('player', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}

	var method = data.method;

	switch (method) {
		case 'getId':
		var id = GUID();

		var player = new Player({
			id: id,
			ip: response.ip
		});

		_players.set(id, player);

		response.answer(id);

		break;

		case 'continueSession':		
		var id = data.id;

		response.answer(!!_players.get(id));

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
