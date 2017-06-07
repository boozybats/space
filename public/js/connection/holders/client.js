ws.set('client', response => {
	var data = response.data;

	if (typeof data !== 'object') {
		return;
	}

	var method = data.method;

	switch (method) {
		case 'connectionTest':
		response.answer();
		break;

		case 'distribution':
		var wrap = {};

		if (typeof Server.client.ondistribution === 'function') {
			Server.client.ondistribution(data, response.answer);
		}
		
		break;
	}
});
