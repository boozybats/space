const update = require('./update');
const items  = require('./methods/items');

const _players = global.storages.players;

// Make distribution one time per frame
update.push(function() {
	// Storage of all items
	var itemsData = items.getEachData();

	// Send for each player data. Not for clients, because they may not play.
	_players.each(player => {
		player.send({
			handler: 'player',
			data: {
				method: 'update',
				items: {
					data: itemsData
				}
			},
			callback: setData
		});
	});
});

function setData(response) {

}
