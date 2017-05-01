const Storage = require('../classes/storage');

const _clients = global.storages.clients;
const _players = global.storages.players;
const _items = global.storages.items;
const _npcs = global.storages.npcs;

// Frequency of update
var frequency = 1000 / 30;

// Callbacks will be executed by each frame
const callbacks = {
	main: new Storage,
	clients: new Storage,
	players: new Storage,
	items: new Storage,
	npcs: new Storage
};
callbacks.main.filter    = (data => typeof data === 'function');
callbacks.clients.filter = (data => typeof data === 'function');
callbacks.players.filter = (data => typeof data === 'function');
callbacks.items.filter   = (data => typeof data === 'function');
callbacks.npcs.filter    = (data => typeof data === 'function');

/* Setup update function by frequency, all added callbacks will be called once
per frame. Can be selected area of update:
main - call once per update
players - call for each player every update
This method optimizes process of updating server's data. */
;(function() {
	var o_time = Date.now();
	setInterval(() => {
		var n_time = Date.now();
		var delta = n_time - o_time;

		if (callbacks.clients.numberkeyLength > 0) {
			callbacks.clients.each(callback => {
				_clients.each(client => {
					callback({
						time: n_time,
						deltaTime: delta,
						client: client
					});
				});
			});
		}

		if (callbacks.players.numberkeyLength > 0) {
			callbacks.players.each(callback => {
				_players.each(player => {
					callback({
						time: n_time,
						deltaTime: delta,
						player: player
					});
				});
			});
		}

		if (callbacks.items.numberkeyLength > 0) {
			callbacks.items.each(callback => {
				_items.each(item => {
					callback({
						time: n_time,
						deltaTime: delta,
						item: item
					});
				});
			});
		}

		if (callbacks.npcs.numberkeyLength > 0) {
			callbacks.npcs.each(callback => {
				_npcs.each(npc => {
					callback({
						time: n_time,
						deltaTime: delta,
						npc: npc
					});
				});
			});
		}

		callbacks.main.each(callback => {
			callback({
				time: n_time,
				deltaTime: delta
			});
		});

		o_time = n_time;
	}, frequency);
})();

function push(callback, area = 'main') {
	var arr = callbacks[area];
	if (!arr) {
		return false;
	}

	var index = arr.push(callback) - 1;

	return index;
}

function remove(index, area = 'main') {
	var arr = callbacks[area];
	if (!arr) {
		return false;
	}

	return arr.remove(index);
}

function getFrequency() {
	return frequency;
}

exports.push = push;
exports.remove = remove;
exports.getFrequency = getFrequency;
