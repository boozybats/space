const update = require('../logic/update');
const items  = require('./items');

const _players = global.storages.players;
const permanentData = {
	method: 'distribution'
};
var wrap = {};

// Make distribution one time per frame
update.push(function({
	time,
	deltaTime,
	player
}) {
	// Storage of all items
	var itemsData = items.getEachData();
	wrap.items = {
		data: itemsData
	};

	/* Set permanent data to wrap because wrap must be updated by creating
	new object. So wrap can be filled anything but by iteration it will
	be erased */
	for (var i in permanentData) {
		if (!permanentData.hasOwnProperty(i)) {
			continue;
		}

		wrap[i] = permanentData[i];
	}

	// Send for each player data. Not for clients, because they may not play.
	player.send({
		handler: 'player',
		data: wrap,
		callback: function(response) {
			if (!player.heaven) {
				return;
			}

			if (time < player.lastActionsUpdateStarttime) {
				return;
			}
			player.lastActionsUpdateStarttime = time;

			// Frequency of distribution update
			var frequency = update.getFrequency();
			// How much time passed before answer
			var currentTime = Date.now();
			// Not really latency, this is how much time passed before last callback
			var latency;

			// For first update set deltaTime as updateTime, no matter
			if (player.lastActionsUpdateReceivetime) {
				latency = currentTime - player.lastActionsUpdateReceivetime;
				/* If latency bigger than double frequency time then change it to
				frequency x2, so actions will not be twitching or abruptly stop */
				latency = Math.min(latency, frequency * 2);
			}
			else {
				latency = frequency;
			}
			player.lastActionsUpdateReceivetime = currentTime;

			player.heaven.applyActions(latency, response.data);
		}
	});

	wrap = {};
}, 'players');

function add(name, data) {
	wrap[name] = data;
}

exports.add = add;
