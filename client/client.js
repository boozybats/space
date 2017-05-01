const Storage = require('../classes/storage');
const Client  = require('../classes/client');
const Player  = require('../classes/player');
const Item    = require('../classes/item');

// Storage with all connected users
var clients = new Storage;
clients.filter = (data => data instanceof Client);
/* All players connected to server with initialized "id", must be binded
to client */
var players = new Storage;
players.filter = (data => data instanceof Player);
// All items, include npc
var items = new Storage;
items.filter = (data => data instanceof Item);
// Only NPC
var npcs = new Storage;
npcs.filter = (data => data instanceof Item);

// Gives access to storages in global variable
global.storages = {
	clients: clients,
	players: players,
	items: items,
	npcs: npcs
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

// Updates items data
require('./items');
// Distribution sends data to client on update
require('./distribution');
// Creates asteroids
require('./crop');

// Holders works on client's messages
require('./holders/player');
require('./holders/items');
require('./holders/heavens');

const update = require('../logic/update');

// Eraser of expired handlers
update.push(function({
	time,
	client
}) {
	client.removeExpiredHandlers(time);
}, 'clients');
