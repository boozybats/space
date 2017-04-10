Server.heavens.getData = function(callback) {
	if (!Server.id) {
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
