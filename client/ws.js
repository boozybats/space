const ws_ = require('ws');
const ip_ = require('ip');

const _listener = 5611;
const _handlers = {};
const _clients = {};

console.log(`Websocket listener - ${_listener}`);

var server = new ws_.Server({port: _listener});

server.on('connection', ws => {
	// Нужно поменять на нормальный ip, когда буду выкладывать на боевой хост
	var ip = GUID();  //ip_.address();
	_clients[ip] = ws;

	ws.on('message', response => {
		if (typeof response === 'string') {
			try {
				var json = JSON.parse(response);

				if (typeof json !== 'object') {
					return;
				}

				var name = json.handler;
				json.ip = ip;

				if (json.GUID) {
					json.answer = function(data, callback) {
						send({
							ip,
							data,
							callback,
							handler: json.GUID
						});
					}
				}

				if (_handlers[name]) {
					_handlers[name](json);
				}
			}
			catch(e) {}
		}
	});

	ws.on('close', () => {
		delete _clients[ip];
	});
});

function set(name, callback) {
	if (typeof callback !== 'function') {
		return;
	}

	_handlers[name] = function(response) {
		callback(response);
	};
}

function remove(name) {
	delete _handlers[name];
}

var GUIDs = [];
function GUID() {
	var key = `${path()}-${path()}-${path()}-${path()}`;
	if (~GUIDs.indexOf(key)) {
		return GUID();
	}
	else {
		GUIDs.push(key);
		return key;
	}

	function path() {
		return (Math.random() * 8999 + 1000).toFixed(0);
	}
}

function send({
	ip,
	handler,
	data,
	callback
} = {}) {
	if (typeof handler !== 'string' || !_clients[ip]) {
		return;
	}

	var wrap = {
		handler,
		data: data
	};

	if (typeof callback === 'function') {
		var guid = GUID();
		wrap.GUID = guid;

		set(guid, response => {
			GUIDs.splice(GUIDs.indexOf(guid), 1);
			remove(guid);
			callback(response);
		});
	}

	_clients[ip].send(JSON.stringify(wrap));
}

//exports
exports.set = set;
exports.remove = remove;
exports.send = send;
