const Storage = require('../../Storage');

/**
 * User's connection to websocket.
 */
class Client {
	constructor({
		websocket,
		ip
	} = {}) {
		this.ip = ip;
		this.websocket = websocket;

		// Handlers is storage for ANSWER-callbacks by front end
		var handlers = new Storage;
		handlers.filter = function(data) {
			return (typeof data === 'function');
		}
		this.handlers_ = handlers;

		// If websocket closed than remove client
		var self = this;
		ws.addEvent('close', ip => {
			if (ip === self.ip) {
				self.remove();
			}
		});
	}

	get websocket() {
		return this.websocket_;
	}
	set websocket(val) {
		if (typeof val !== 'object') {
			var ip = this.ip;
			console.warn(`Wrong websocket, ip: ${ip}, type: ${typeof val}`);
		}

		this.websocket_ = val;
	}

	// Executes handler and remove, is called by answer.
	execHandler(name, data) {
		var handler = this.handlers.get(name);
		if (!handler) {
			return false;
		}

		handler(data);

		this.removeHandler(name);

		return true;
	}

	get handlers() {
		return this.handlers_;
	}

	isHandler(name) {
		return !!this.handlers.get(name);
	}

	get player() {
		return this.player_;
	}

	set player(val) {
		if (!val || val instanceof Player) {
			this.player_ = val;
		}
	}

	remove() {
		if (this.player) {
			this.player.remove();
		}

		if (typeof this.onremove === 'function') {
			this.onremove();
		}
	}

	removeHandler(name) {
		return this.handler.remove(name);
	}

	/* Completes "send"-function from websocket-script, but automaticly
	sends "ip" */
	send({
		handler,
		data,
		callback
	} = {}) {
		return ws.send({
			ip: this.ip,
			handler: handler,
			data: data,
			callback: callback
		});
	}

	// Sets answer-callback
	setHandler(name, callback) {
		return this.handlers.set(name, callback);
	}

	// Binds player to client
	setPlayer(player) {
		if (!(player instanceof Player)) {
			return;
		}

		this.player = player;
		player.client = this;
	}
}

module.exports = Client;

const ws     = require('../ws');
const Player = require('./player');
