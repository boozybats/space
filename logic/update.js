const Storage = require('../classes/storage');

const _clients = global.storages.clients;
const _players = global.storages.players;
const _items = global.storages.items;
const _npcs = global.storages.npcs;

// Frequency of update
var frequency = 1000 / 60;

// Callbacks will be executed by each frame
const callbacks = {
	start: new Storage,
	clients: new Storage,
	players: new Storage,
	items: new Storage,
	npcs: new Storage,
	end: new Storage
};
callbacks.start.filter   = (data => typeof data === 'function');
callbacks.clients.filter = (data => typeof data === 'function');
callbacks.players.filter = (data => typeof data === 'function');
callbacks.items.filter   = (data => typeof data === 'function');
callbacks.npcs.filter    = (data => typeof data === 'function');
callbacks.end.filter     = (data => typeof data === 'function');

/* Setup update function by frequency, all added callbacks will be called once
per frame. Can be selected area of update:
start - call on start of update
clients - call for each client
players - call for each player every update
items - call for each item
npcs - call for each npc
end - call on end of update
This method optimizes process of updating server's data. */
;(function() {
	var o_time = Date.now();
	setInterval(() => {
		var n_time = Date.now();
		var delta = n_time - o_time;

		callbacks.start.each(callback => {
			callback({
				time: n_time,
				deltaTime: delta
			});
		});

		callbacks.clients.each(callback => {
			_clients.each(client => {
				callback({
					time: n_time,
					deltaTime: delta,
					client: client
				});
			});
		});

		callbacks.players.each(callback => {
			_players.each(player => {
				callback({
					time: n_time,
					deltaTime: delta,
					player: player
				});
			});
		});

		callbacks.items.each(callback => {
			_items.each(item => {
				callback({
					time: n_time,
					deltaTime: delta,
					item: item
				});
			});
		});

		callbacks.npcs.each(callback => {
			_npcs.each(npc => {
				callback({
					time: n_time,
					deltaTime: delta,
					npc: npc
				});
			});
		});

		callbacks.end.each(callback => {
			callback({
				time: n_time,
				deltaTime: delta
			});
		});

		o_time = n_time;
	}, frequency);
})();

function push(callback, area = 'start') {
	var arr = callbacks[area];
	if (!arr) {
		return false;
	}

	var index = arr.push(callback) - 1;

	return index;
}

function remove(index, area = 'start') {
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
