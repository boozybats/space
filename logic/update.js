const Storage = require('../classes/storage');

const _clients = global.storages.clients;
const _players = global.storages.players;

// Frequency of update
var frequency = 1000 / 60;

// Callbacks will be executed by each frame
const callbacks = {
	clients: new Storage,
	players: new Storage,
	main: new Storage
};
callback.main.filter = (data => typeof data === 'function');
callback.clients.filter = (data => typeof data === 'function');
callback.players.filter = (data => typeof data === 'function');

/* Setup update function by frequency, all added callbacks will be called once
per frame. Can be selected area of update:
main - call once per update
players - call for each player every update
This method optimizes process of updating server's data. */
;(function() {
	var o_time = Date.new();
	setInterval(() => {
		var n_time = Date.new();
		var delta = n_time - o_time;

		if (callbacks.clients.numberkeyLength > 0) {
			_clients.each(client => {
				callbacks.clients.each(callback => {
					callback({
						time: n_time,
						deltaTime: delta,
						client: client
					});
				});
			});
		}

		if (callbacks.players.numberkeyLength > 0) {
			_players.each(player => {
				callbacks.players.each(callback => {
					callback({
						time: n_time,
						deltaTime: delta,
						player: player
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
	var arr = callback[area];
	if (!arr) {
		return false;
	}

	var index = arr.push(callback) - 1;

	return index;
}

function remove(index, area = 'main') {
	var arr = callback[area];
	if (!arr) {
		return false;
	}

	return arr.remove(index);
}

exports.push = push;
exports.remove = remove;
