const ws_     = require('ws');
const ip_     = require('ip');
const Storage = require('../classes/storage');
const Client  = require('../classes/client');
const servers = require('../logic/servers');

const _listener = 5611;
const _clients = global.storages.clients;
// after client connection choose server for him
_clients.onadd(client => {
	servers.appendClient(client);
});

// Handlers is callback function, requests from front end redirects into handler
const _handlers = new Storage;
_handlers.filter = function(data) {
	return (typeof data === 'function');
}

console.log(`Websocket listener - ${_listener}`);

var server = new ws_.Server({port: _listener});

server.on('connection', ws => {
	// Нужно поменять на нормальный ip, когда буду выкладывать на боевой хост
	var ip = GUID();  //ip_.address();

	// Initialize new user
	connect(ws, ip);

	ws.on('message', response => {
		message(ip, response);
	});

	ws.on('close', () => {
		close(ip);
	});
});

// Generates unique string, ex: '192.168.0.1'
var GUIDs = [];
function GUID() {
	var key = `${path()}.${path()}.${path()}.${path()}`;
	if (~GUIDs.indexOf(key)) {
		return GUID();
	}
	else {
		GUIDs.push(key);
		return key;
	}

	function path() {
		return (Math.random() * 255).toFixed(0);
	}
}

// Sets handler
function set(name, callback) {
	_handlers.set(name, response => {
		callback(response);
	});
}

// Removes handler
function remove(name) {
	_handlers.remove(name);
}

// Sends message to front end
function send(options) {
	if (typeof options !== 'object') {
		console.log(`ws: send: "options" must be an object, type: ${typeof options}, value: ${options}`);
		return false;
	}

	var ip = options.ip;

	var client = getClient(ip);
	if (!client) {
		console.log(`ws: send: undeclared user, ip: ${ip}`);
		return false;
	}

	var result = client.send(options);

	if (result) {
		return true;
	}
	else {
		close(ip);

		return false;
	}
}

// Is called by message from front end
function message(ip, response) {
	if (typeof response !== 'string') {
		return;
	}

	try {
		var json = JSON.parse(response);
	}
	catch(err) {
		if (err) {
			return;
		}
	}

	if (typeof json !== 'object') {
		return;
	}

	// Add to data in callbacks ip (needs sometime)
	json.ip = ip;

	// Define client to answer-function
	var client = getClient(ip);
	if (!client) {
		console.log(`ws: message: undeclared user, ip: ${ip}`);
		return;
	}

	// Name of handler
	var name = json.handler;

	// Sends back a request to front end
	var answer = json.answer;
	if (typeof answer !== 'undefined') {
		json.answer = function(data, callback, lifetime) {
			client.send({
				handler: answer,
				data: data,
				callback: callback,
				callbackLifetime: lifetime
			});
		}
	}
	else {
		json.answer = function() {};
	}

	// Defines is it answer or regular handler
	// Client's handlers is answers, ws hadnlers is new requests
	if (client.isHandler(name)) {
		client.execHandler(name, json);
	}
	else if (_handlers.get(name)) {
		var handler = _handlers.get(name);

		handler(json);
	}
}

// Is called when new user connected to websockets
function connect(ws, ip) {
	var client = new Client({
		websocket: ws,
		ip: ip
	});
	_clients.set(ip, client);
}

// Is called when any port is closing
function close(ip) {
	getClient(ip).remove();
	_clients.remove(ip);

	events.close.each(event => {
		event(ip);
	});
}

// Websocket's events, ex: 'close', 'connect', ...
var events = {
	close: new Storage
};
events.close.filter = function(data) {
	return (typeof data === 'function');
}

// Adds event to websocket
function addEvent(handler, callback) {
	var event = events[handler];
	if (!event) {
		return;
	}

	var index = event.push(callback) - 1;

	return index;
}

function removeEvent(handler, index) {
	var event = events[handler];
	if (!event) {
		return;
	}

	var result = event.remove(index);

	return result;
}

function getClient(ip) {
	return _clients.get(ip);
}

// exports
var exp = {
	addEvent: addEvent,
	removeEvent: removeEvent,
	getClient: getClient,
	set: set,
	remove: remove,
	send: send
};

module.exports = exp;
