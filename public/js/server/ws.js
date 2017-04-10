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
	handlers: {},
	set: function(name, callback) {
		if (typeof callback === 'function') {
			ws.handlers[name] = callback;

			return true;
		}

		return false;
	},
	remove: function(name) {
		if (ws.handlers[name]) {
			delete ws.handlers[name];

			return true;
		}

		return false;
	},
	/**
	 * Sends json to server-side, if callback selected then generates
	 * GUID for answer
	 * 
	 * @param  {Object} options Required params: handler (name),
	 *  not required: data (any type), callback
	 * @param {string} handler
	 * @param {*} data
	 * @param {Function} callback
	 */
	send: function(options = {
		handler,
		data,
		callback
	}) {
		if (ws.ready) {
			if (typeof options !== 'object') {
				console.warn('Corrupted websocket request: "options" must be an object');
				return false;
			}

			var wrap = {
				handler: options.handler,
				data: options.data
			};

			if (typeof options.callback === 'function') {
				var ansname = `${options.handler}-answer`;
				ws.set(ansname, response => {
					ws.remove(ansname);
					options.callback(response);
				});
			}

			try {
				ws.socket.send(JSON.stringify(wrap));
				return true;
			}
			catch (err) {
				if (err) {
					return false;
				}
			}
		}
		else {
			setTimeout(function() {
				ws.send(options);
			}, 100);
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

		json.answer = function(data, callback) {
			ws.send({
				data: data,
				callback: callback,
				handler: `${name}-answer`
			});
		}

		if (ws.handlers[name]) {
			ws.handlers[name](json);
		}
	}
}
