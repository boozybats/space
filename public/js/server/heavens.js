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
		callback
	});
}
