const update = require('../logic/update');
const items  = require('./methods/items');

const _players = global.storages.players;

// Make distribution one time per frame
update.push(function({
	time,
	deltaTime,
	player
}) {
	// Storage of all items
	var itemsData = items.getEachData();

	// Send for each player data. Not for clients, because they may not play.
	player.send({
		handler: 'player',
		data: {
			method: 'update',
			items: {
				data: itemsData
			}
		},
		callback: function(response) {
			if (!player.heaven) {
				return;
			}

			// How much time passed before answer
			var delta;
			if (player.lastActionsUpdate) {
				delta = time - player.lastActionsUpdate;
			}
			else {
				delta = 0;
			}
			player.lastActionsUpdate = time;

			player.heaven.applyActions(delta, response.data);
		}
	});
}, 'players');
