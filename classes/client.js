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

		// b/ms
		this.throughput_ = 0;
		// latency between server and client
		this.ping_ = 0;
		// Time to next distribution
		this.distributionTime = 0;

		this.updateConnectionInfo();
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
			console.log(`Client: websocket: wrong websocket, ip: ${this.ip}, type: ${typeof val}`);
		}

		this.websocket_ = val;
	}

	// Are executed on distribution callback and uses client's data
	distribution(latency, data) {
		var player = this.player;
		if (player) {
			var heaven = player.heaven,
				actions = data.actions;

			if (heaven && typeof actions === 'object') {
				heaven.applyActions(latency, actions);
			}
		}
	}

	get distributionTime() {
		return this.distributionTime_;
	}
	set distributionTime(val) {
		if (typeof val !== 'number') {
			val = 0;
		}

		this.distributionTime_ = val;
	}

	// Executes handler and remove, is called by answer.
	execHandler(key, data) {
		if (!this.isHandler(key)) {
			return false;
		}

		var handler = this.handlers[key];
		handler.callback(data);

		this.removeHandler(key);

		return true;
	}

	isHandler(key) {
		return (this.handlers[key] instanceof Handler);
	}

	get lastActionsUpdateReceivetime() {
		return this.lastActionsUpdateReceivetime_;
	}
	set lastActionsUpdateReceivetime(val) {
		if (typeof val !== 'number') {
			val = Date.now();
		}

		this.lastActionsUpdateReceivetime_ = val;
	}

	get lastActionsUpdateStarttime() {
		return this.lastActionsUpdateStarttime_;
	}
	set lastActionsUpdateStarttime(val) {
		if (typeof val !== 'number') {
			val = Date.now();
		}

		this.lastActionsUpdateStarttime_ = val;
	}

	get player() {
		return this.player_;
	}
	set player(val) {
		if (!val || val instanceof Player) {
			this.player_ = val;
		}
	}

	get ping() {
		return this.ping_;
	}

	remove() {
		if (typeof this.onremove === 'function') {
			this.onremove();
		}

		if (this.player) {
			this.player.remove();
		}
	}

	removeExpiredHandlers(date) {
		for (var i = 0; i < this.handlers.length; i++) {
			if (!this.isHandler(i)) {
				continue;
			}

			var handler = this.handlers[i];
			if (!handler.startLifetime) {
				handler.startLifetime = date;
			}

			if (date > handler.startLifetime + handler.lifetime) {
				this.removeHandler(i);
			}
		}
	}

	removeHandler(key) {
		if (!this.isHandler(key)) {
			console.log(`Client: removeHandler: can not delete nonexistent handler, key: ${key}, value: ${this.handlers[key]}`);
			return false;
		}

		delete this.handlers[key];
		this.freehandlers.push(key);

		return true;
	}

	/* Completes "send"-function from websocket-script, but automaticly
	sends "ip" */
	send({
		handler,
		data,
		callback,
		callbackLifetime
	} = {}) {
		// Data to send to front end
		var wrap = {
			handler: handler,
			data: data
		};

		// If needs a callback from front enmd than set answer-callback
		if (typeof callback === 'function') {
			wrap.answer = this.setHandler(callback, {
				lifetime: callbackLifetime
			});
		}

		try {
			var json = JSON.stringify(wrap);
			this.websocket.send(json);
		}
		catch (err) {
			if (err) {
				return 0;
			}
		}

		return json.length;
	}

	// Sets answer-callback
	setHandler(callback, {
		lifetime = 15000
	}) {
		if (typeof callback !== 'function') {
			console.log(`Client: setHandler: can not set not a function to callback, type: ${typeof callback}, value: ${callback}, lifetime: ${lifetime}`);
			return false;
		}
		else if (typeof lifetime !== 'number') {
			console.log(`Client: setHandler: "lifetime" must be a number, now is "${typeof lifetime}" with value ${lifetime}, function: ${callback.toString()}`);
			lifetime = 15000;
		}

		var handler = new Handler({
			callback: callback,
			lifetime: lifetime
		});

		var index = this.freehandlers[0];
		if (typeof index === 'number') {
			this.handlers[index] = handler;
			this.freehandlers.splice(0, 1);
		}
		else {
			index = this.handlers.push(handler) - 1;
		}

		return index;
	}

	// Binds player to client
	setPlayer(player) {
		if (!(player instanceof Player)) {
			console.log(`Client: setPlayer: "player" must be a Player class, type ${typeof player}, value: ${player}`);
			return;
		}

		this.player = player;
		player.client = this;
	}

	get throughput() {
		return this.throughput_;
	}

	// Updates client throughput and ping
	updateConnectionInfo() {
		// Data to send to client
		var wrap = {
			handler: 'client',
			data: {
				method: 'connectionTest'
			}
		};

		var self = this;
		// Start position of message size
		var size = 0;
		// How much time passes between server and client
		var ping = 0;
		/* How much time latency needs to stop tests, the more it is bigger
		the more specific results it have but spends more time */
		var boundtime = 300;
		var date;

		// First callback defines ping then change on detemined
		wrap.callback = function() {
			/* Approximate value of ping, divided on two because client->server
			have latency too, needs only server->client */
			ping = (Date.now() - date) / 2;
			self.ping_ = ping;

			wrap.callback = callback;

			send();
		}
		this.send(wrap);
		date = Date.now();

		// Sends data with message by index "size" to client
		function send() {
			wrap.data.message = bigdata[size];
			self.send(wrap);

			date = Date.now();
		}

		function callback() {
			// Approximate latency, this shouldn't take latency from client to server
			var latency = (Date.now() - date) - ping;

			// If message are got faster than bound time then send bigger one
			if (latency < boundtime && bigdata[size + 1]) {
				size++;
				send();
			}
			else {
				size = bigdata[size].length;

				self.throughput_ = Math.trunc(size / latency);
			}
		}
	}
}

// Helps to understand when callback expires
class Handler {
	constructor({
		callback,
		lifetime = 0,
		startLifetime = 0
	}) {
		this.callback = callback;
		this.lifetime = lifetime;
		this.startLifetime = startLifetime;
	}

	get callback() {
		return this.callback_;
	}
	set callback(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.callback_ = val;
	}

	get lifetime() {
		return this.lifetime_;
	}
	set lifetime(val) {
		if (typeof val !== 'number') {
			val = 0;
		}

		this.lifetime_ = val;
	}

	get startLifetime() {
		return this.startLifetime_;
	}
	set startLifetime(val) {
		if (typeof val !== 'number') {
			val = 0;
		}

		this.startLifetime_ = val;
	}
}

module.exports = Client;

const Player = require('./player');

// Big message to send user and check throughput
var bigdata = ['', '', '', '', '', ''];
;(function() {
	// 1 Kb
	for (var i = 1024; i--;) {
		bigdata[0] += '0';
	}

	// 10 Kb
	for (var i = 10; i--;) {
		bigdata[1] += bigdata[0];
	}

	// 100 Kb
	for (var i = 10; i--;) {
		bigdata[2] += bigdata[1];
	}

	// 1 Mb
	for (var i = 1024; i--;) {
		bigdata[3] += bigdata[0];
	}


	// 10 Mb
	for (var i = 10; i--;) {
		bigdata[4] += bigdata[3];
	}

	// 20 Mb
	for (var i = 2; i--;) {
		bigdata[5] += bigdata[4];
	}

	// 40 Mb
	for (var i = 2; i--;) {
		bigdata[6] += bigdata[5];
	}

	// 80 Mb
	for (var i = 2; i--;) {
		bigdata[7] += bigdata[6];
	}
})();
