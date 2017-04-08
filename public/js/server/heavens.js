Server.heavens.instance = function(callback) {
	if (!Server.id) {
		return;
	}

	ws.send({
		handler: 'heavens',
		data: {
			method: 'instance',
			id: Server.id
		},
		callback
	});
}
