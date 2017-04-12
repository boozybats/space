/**
 * WebSocket's wrap, holds WebSocket in parameter "socket",
 * binds callback by handler name (function "set"), callback
 * can be removed (function "remove"), sends json object to
 * server-side.
 * 
 * @type {Object}
 */
const ws = {
	socket: new WebSocket(`ws://localhost:5611`),
	client: new Client,
	handlers: new Storage,
	ready: false,
	set: function(name, callback) {
		if (typeof callback !== 'function') {
			return false;
		}

		ws.handlers.set(name, callback);

		return true;
	},
	remove: function(name) {
		return ws.handlers.remove(name);
	},
	/**
	 * Sends json to server-side, if callback selected then makes an answer-
	 * callback function into client.
	 * 
	 * @param  {Object} options Required params: handler (name),
	 *  not required: data (any type), callback
	 * @param {String} handler
	 * @param {*} data
	 * @param {Function} callback
	 */
	send: function(options = {
		handler,
		data,
		callback
	}) {
		// Send message later when websocket will be loaded
		if (!ws.ready) {
			setTimeout(function() {
				ws.send(options);
			}, 100);

			return false;
		}

		if (typeof options !== 'object') {
			console.warn('Corrupted websocket request: "options" must be an object');
			return false;
		}

		// Data to send to server
		var wrap = {
			handler: options.handler,
			data: options.data
		};

		// If needs a callback from server than set answer-callback
		var callback = options.callback;
		if (typeof callback === 'function') {
			wrap.answer = ws.client.setHandler(callback);
		}

		try {
			ws.socket.send(JSON.stringify(wrap));
			return true;
		}
		catch (err) {
			if (err) {
				console.warn('Websocket error: ', err.text);
				return false;
			}
		}
	}
};

ws.socket.onopen = function() {
	ws.ready = true;
}

ws.socket.onclose = function() {
	ws.ready = false;
}

// redirects request to handler-functions if exists
ws.socket.onmessage = function(response) {
	if (!response.isTrusted) {
		return;
	}
	
	response = response.data;
	if (typeof response === 'string') {
		try {
			var json = JSON.parse(response);
		}
		catch(err) {
			if (err) {
				return;
			}
		}

		var name = json.handler;

		// Sends back a request to server
		var answer = json.answer;
		if (typeof answer !== 'undefined') {
			json.answer = function(data, callback) {
				ws.send({
					data: data,
					callback: callback,
					handler: answer
				});
			}
		}
		else {
			json.answer = function() {};
		}

		// Check if it answer-callback else check in handlers
		if (ws.client.isHandler(name)) {
			ws.client.execHandler(name, json);
		}
		else if (ws.handlers.get(name)) {
			var handler = ws.handlers.get(name);
			handler(json);
		}
	}
}
