ws.set('player', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}

	var method = data.method;

	switch (method) {
		case 'update':
		if (typeof data.items === 'object') {
			var items = data.items.data;

			if (Server.player.ondistribution) {
				Server.player.ondistribution(items);
			}

			if (player instanceof Player) {
				var actions = player.getActions();
				player.clearActions();
				response.answer(actions);
			}
		}

		break;
	}
});
