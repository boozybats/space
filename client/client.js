const Storage = require('../storage');

global.storages = {
	players: new Storage,
	items: new Storage
};

global.verification = function(id, ip) {
	var player = global.storages.players.get(id);
	if (!player) {
		return false;
	}

	var pip = player.ip;

	return pip === ip;
}

require('./distribution');
require('./holders/player');
require('./holders/items');
require('./holders/heavens');
