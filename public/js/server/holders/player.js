ws.set('player', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}

	var method = data.method;

	switch (method) {
		case 'distribution':
		if (typeof Server.player.ondistribution === 'function') {
			Server.player.ondistribution(data);
		}

		if (player instanceof Player) {
			var actions = player.getActions();
			player.clearActions();
			response.answer(actions);
		}

		break;
	}
});
