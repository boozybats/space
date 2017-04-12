const Storage = require('../storage');
const Client  = require('./classes/client');
const Player  = require('./classes/player');
const Item    = require('./classes/item');

// Storage with all connected users
var clients = new Storage;
clients = (data => data instanceof Client);
/* All players connected to server with initialized "id", must be binded
to client */
var players = new Storage;
players = (data => data instanceof Player);
// All items, include npc
var items = new Storage;
items = (data => data instanceof Item);

// Gives access to storages in global variable
global.storages = {
	clients: clients,
	players: players,
	items: items
};

/**
 * Checks on veracity player's ip and id
 * @param  {Number} id
 * @param  {Number} ip
 * @return {Boolean}
 */
global.verification = function(id, ip) {
	var player = players.get(id);
	if (!player || !player.client) {
		return false;
	}

	var pip = player.client.ip;

	return pip === ip;
}

// Scripts initialization

// Distribution sends data to client on update
require('./distribution');

// Holders works on client's messages
require('./holders/player');
require('./holders/items');
require('./holders/heavens');

const update = require('./update');

// Eraser of expired handlers
update.push(function({
	time,
	client
}) {
	client.removeExpiredHandlers(time);
}, 'clients');
