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

const ws = {
	socket: new WebSocket(`ws://localhost:8889`),
	handlers: {},
	set: (name, callback) => {
		ws.handlers[name] = callback;
	},
	remove: (name) => {
		delete ws.handlers[name];
	},
	send: (options = {
		handler,
		id,
		data,
		callback
	}) => {
		if (ws.ready) {
			var wrap = {
				handler: options.handler,
				id: options.id,
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

ws.socket.onmessage = function(response) {
	response = response.data;
	if (typeof response === 'string') {
		try {
			var json = JSON.parse(response);

			var name = json.handler;

			if (json.GUID) {
				json.answer = (data, callback) => {
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
