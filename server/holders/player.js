const ws     = require('../ws');
const Player = require('../../classes/player');
const guid   = require('../../logic/guid');

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
		var id = guid.gen();

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

function appendPlayer(id, ip) {
	var player = new Player({
		id: id
	});

	var client = ws.getClient(ip);
	client.setPlayer(player);

	_players.set(id, player);
	player.onremove = function() {
		_players.remove(id);
		guid.clear(id);
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
