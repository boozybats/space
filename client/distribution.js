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

			if (time < player.lastActionsUpdateStarttime) {
				return;
			}
			player.lastActionsUpdateStarttime = time;

			// How much time passed before answer
			var currentTime = Date.now();
			// Not really latency, this is how much time passed before last callback
			var latency;
			if (player.lastActionsUpdateReceivetime) {
				latency = currentTime - player.lastActionsUpdateReceivetime;
			}
			else {
				latency = update.getFrequency();
			}
			player.lastActionsUpdateReceivetime = currentTime;

			player.heaven.applyActions(latency, response.data);
		}
	});
}, 'players');
