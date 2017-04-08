const update = require('../update');

const _players = global.storages.players;

update.push(function() {
	var itemsData = items.getEachData();

	_players.each(function(player) {
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

const items = require('./methods/items');
