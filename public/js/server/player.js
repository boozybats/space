Server.player.defineId = function(callback) {
	var id = cookie.read('id');

	if (typeof id === 'number') {
		Server.player.continueSession(id, function(response) {
			if (response.data) {
				Server.id = id;
				callback(id);
			}
			else {
				cookie.remove('id');
				Server.player.defineId(callback);
			}
		});
	}
	else {
		Server.player.getId(function(response) {
			var id = response.data;
			Server.id = id;

			cookie.set('id', id);

			callback(id);
		});
	}
}

Server.player.getId = function(callback) {
	ws.send({
		handler: 'player',
		data: {
			method: 'getId'
		}
		callback
	});
}

Server.player.continueSession = function(id, callback) {
	ws.send({
		handler: 'player',
		data: {
			method: 'continueSession',
			id: id
		},
		callback
	})
}
