Server.items.getAll = function(callback) {
	if (!Server.id) {
		return;
	}

	ws.send({
		handler: 'items',
		data: {
			method: 'getAll',
			id: Server.id
		},
		callback: function(response) {
			var data = response.data;

			callback(data);
		}
	});
}

Server.items.setData = function(data) {
	if (!Server.id) {
		return;
	}

	ws.send({
		handler: 'items',
		data: {
			method: 'setItemData',
			id: Server.id,
			item: data
		}
	});
}
