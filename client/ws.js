const Storage = require('../storage');
const ws_     = require('ws');
const ip_     = require('ip');

const _listener = 5611;

// Handlers is callback function, requests from front end redirects into handler
const _handlers = new Storage;
_handlers.filter = function(data) {
	return (typeof data === 'function');
}
// Storage with all connected users
const _clients = new Storage;

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

// Generates unique string, ex: '1234-5678-9101-1121'
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

// Sets handler
function set(name, callback) {
	_handlers.set(name, response => {
		callback(response);
	});
}

// Removs handler
function remove(name) {
	_handlers.remove(name);
}

function send({
	ip,
	handler,
	data,
	callback
} = {}) {
	var client = getClient(ip);
	if (!client) {
		return;
	}

	// Data to send to front end
	var wrap = {
		handler: handler,
		data: data
	};

	// If needs a callback from front enmd than set answer-callback
	if (typeof callback === 'function') {
		wrap.answer = client.setHandler(callback);
	}

	try {
		client.websocket.send(JSON.stringify(wrap));
	}
	catch (err) {
		if (err) {
			close(ip);
			return false;
		}
	}

	return true;
}

// Is called when new user connected to websockets
function connect(ws, ip) {
	var client = new Client({
		websocket: ws,
		ip: ip
	});
	_clients.set(ip, client);
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
	// Name of handler
	var name = json.handler;

	// Sends back a request to front end
	var answer = json.answer;
	if (typeof answer !== 'undefined') {
		json.answer = function(data, callback) {
			client.send({
				data: data,
				callback: callback,
				handler: answer
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

// Is called when any port is closing
function close(ip) {
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

const Client  = require('./classes/client');
