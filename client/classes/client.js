/**
 * User's connection to websocket.
 */
class Client {
	constructor({
		ip,
		websocket
	} = {}) {
		this.ip = ip;
		this.websocket = websocket;

		// Handlers is storage for ANSWER-callbacks by front end
		this.handlers = [];

		/* Free handlers array contains numbers of empty array-positions,
		it needs for optimization: handlers array will not be inifnite big,
		freehandlers will fill empty key-positions */
		this.freehandlers = [];

		// If websocket closed than remove client
		var self = this;
		var handler = ws.addEvent('close', ip => {
			ws.removeEvent('close', handler);

			if (ip === self.ip) {
				self.remove();
			}
		});

		this.anonymousfunction = function() {};
	}

	get ip() {
		return this.ip_;
	}
	set ip(val) {
		if (typeof val !== 'string') {
			val = '0.0.0.0';
		}

		this.ip_ = val;
	}

	get websocket() {
		return this.websocket_;
	}
	set websocket(val) {
		if (typeof val !== 'object') {
			console.warn(`Wrong websocket, ip: ${this.ip}, type: ${typeof val}`);
		}

		this.websocket_ = val;
	}

	// Executes handler and remove, is called by answer.
	execHandler(key, data) {
		var handler = this.handlers.get(key);
		if (!handler) {
			return false;
		}

		handler(data);

		this.removeHandler(key);

		return true;
	}

	isHandler(key) {
		return (typeof this.handlers[key] !== 'undefined');
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
		if (typeof this.onremove === 'function') {
			this.onremove();
		}

		if (this.player) {
			this.player.remove();
		}
	}

	removeHandler(key) {
		if (typeof this.handlers[key] !== 'function') {
			return false;
		}

		this.handlers[key] = this.anonymousfunction;
		this.freehandlers.push(key);

		return true;
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
	setHandler(callback) {
		if (typeof callback !== 'function') {
			return false;
		}

		var index = this.freehandlers[0];
		if (typeof index === 'number') {
			this.handlers[index] = callback;
			this.freehandlers.splice(0, 1);
		}
		else {
			index = this.handlers.push(callback) - 1;
		}

		return index;
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
