const ws     = require('../ws');
const Player = require('../classes/player');

const _players = global.storages.players;
const _items   = global.storages.items;

ws.set('player', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}

	var method = data.method;

	switch (method) {
		case 'getId':
		var id = GUID();

		appendPlayer(id, response.ip);

		response.answer(id);

		break;

		case 'continueSession':	
		var id = data.id;

		var result = getPlayer(id, response.ip);

		response.answer(result);

		break;
	}
});

var GUIDs = [];
function GUID() {
	function path() {
		return ((Math.random() * 9999999999).toFixed(0) - 0);
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

function appendPlayer(id, ip) {
	var player = new Player({
		id: id
	});

	var client = ws.getClient(ip);
	client.setPlayer(player);

	_players.set(id, player);
	player.onremove = function() {
		_players.remove(id);
	}
}

function getPlayer(id, ip) {
	var result;

	var player = _players.get(id);
	if (player && player.client) {
		result = (player.client.ip === ip);
	}
	else {
		result = false;
	}

	return result;
}

function getItemsData() {
	var out = [];
	var id = data.id;

	_items.each(item => {
		if (item.id !== id) {
			out.push(item.toJSON());
		}
	});

	response.answer(out);
}
