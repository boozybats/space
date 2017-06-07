Server.heavens.getData = function(callback) {
	if (typeof Server.id !== 'number') {
		return;
	}

	ws.send({
		handler: 'heavens',
		data: {
			method: 'getData',
			id: Server.id
		},
		callback: function(response) {
			if (typeof response !== 'object') {
				return;
			}

			callback(response.data);
		}
	});
}
