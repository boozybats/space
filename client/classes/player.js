class Player {
	constructor({
		id,
		ip
	} = {}) {
		this.id = id;
		this.ip = ip;
	}

	send({
		handler,
		data,
		callback
	}) {
		ws.send({
			ip: this.ip,
			handler,
			data,
			callback
		});
	}
}

module.exports = Player;

const ws = require('../ws');
