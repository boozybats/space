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
	set: (name, callback) => {
		ws.handlers[name] = callback;
	},
	remove: (name) => {
		delete ws.handlers[name];
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
	send: (options = {
		handler,
		data,
		callback
	}) => {
		if (ws.ready) {
			var wrap = {
				handler: options.handler,
				data: options.data
			};

			if (typeof options.callback === 'function') {
				var guid = GUID();
				wrap.GUID = guid;

				ws.set(guid, response => {
					GUIDs.splice(GUIDs.indexOf(guid), 1);
					ws.remove(guid);
					options.callback(response);
				});
			}

			ws.socket.send(JSON.stringify(wrap));
		}
		else {
			setTimeout(function() {
				ws.send(options)
			}, 100);
		}
	}
};

ws.socket.onopen = function() {
	ws.ready = true;
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

			var name = json.handler;

			if (json.GUID) {
				json.answer = function(data, callback) {
					ws.send({
						data,
						callback,
						handler: json.GUID
					});
				}
			}

			if (ws.handlers[name]) {
				ws.handlers[name](json);
			}
		}
		catch(e) {
		}
	}
}

const GUIDs = [];
function GUID() {
	function path() {
		return (Math.random() * 8999 + 1000).toFixed(0);
	}
	var key = `${path()}-${path()}-${path()}`;
	if (GUIDs.indexOf(key) === -1) {
		GUIDs.push(key);
		return key;
	}
	else {
		return GUID();
	}
}
