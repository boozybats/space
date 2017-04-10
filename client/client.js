const Storage = require('../storage');
const Item    = require('./classes/item');
const Player  = require('./classes/player');

// All items, include npc
var items = new Storage;
items.filter = function(data) {
	return (data instanceof Item);
}

/* All players connected to server with initialized "id", must be binded
to client */
var players = new Storage;
players.filter = function(data) {
	return (data instanceof Player);
}

// Gives access to storages in global variable
global.storages = {
	items,
	players
};

/**
 * Checks on veracity player's ip and id
 * @param  {Number} id
 * @param  {Number} ip
 * @return {Boolean}
 */
global.verification = function(id, ip) {
	var player = players.get(id);
	if (!player) {
		return false;
	}

	var pip = player.ip;

	return pip === ip;
}

// Scripts initialization

// Distribution sends data to client on update
require('./distribution');

// Holders works on client's messages
require('./holders/player');
require('./holders/items');
require('./holders/heavens');
