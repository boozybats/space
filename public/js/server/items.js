Server.items.getAll = function(callback) {
	if (!server.id) {
		return;
	}

	ws.send({
		handler: 'items',
		data: {
			method: 'getAll',
			data: {
				id: Server.id
			},
			callback: function(response) {
				var data = response.data;

				callback(data);
			}
		}
	});
}
