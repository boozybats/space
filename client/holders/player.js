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

		var player = new Player({
			id: id
		});

		var client = ws.getClient(response.ip);
		client.setPlayer(player);

		appendPlayer(id, player);

		response.answer(id);

		break;

		case 'continueSession':	
		var id = data.id;

		var result;
		var player = _players.get(id);
		if (player && player.client) {
			result = player.client.ip === response.ip;
		}
		else {
			result = false;
		}

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

function appendPlayer(id, player) {
	_players.set(id, player);
	player.onremove = function() {
		var handler = _players.remove(id);
		ws.removeEvent(handler);
	}
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
