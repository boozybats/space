const update = require('../logic/update');
const items  = require('./items');

const _players = global.storages.players;

// How much longer than maxrate can be request
const limitIndex = 4;
// How often times in second server can send data to clients
const maxrate = 20;
// Maximal latency value to keep server rate update for client
const expectedLatency = 100;
// Important data wich must be sended to client everytime
const permanentData = {
	method: 'distribution'
};
var wrap = {};

// Storage of all items
var itemsData;

// Update all items on update iteration start and define options to send to client
update.push(function() {
	itemsData = items.getEachData();
	wrap.items = itemsData;

	/* Set permanent data to wrap because wrap must be updated by creating
	new object. So wrap can be filled anything but by iteration it will
	be erased */
	for (var i in permanentData) {
		if (!permanentData.hasOwnProperty(i)) {
			continue;
		}

		wrap[i] = permanentData[i];
	}
}, 'start');

// Erase wrap custom data on update iteration end
update.push(function() {
	wrap = {};
}, 'end');

// Make distribution by server rate
update.push(function({
	time,
	deltaTime,
	client
}) {
	client.distributionTime -= deltaTime;

	var throughput = client.throughput;

	// If client can't get data
	if (throughput === 0) {
		return;
	}
	// If this isn't distribution time for this client
	else if (client.distributionTime > 0) {
		return;
	}

	// Frequency of update
	var frequency = 1000 / maxrate;

	// Send for each client distribution
	var size = client.send({
		handler: 'client',
		data: wrap,
		callback: function(response) {
			if (time < client.lastActionsUpdateStarttime) {
				return;
			}
			client.lastActionsUpdateStarttime = time;

			/* Not really latency, this is how much time passed before
			last callback and start distribution time */
			var latency = Date.now() - time;

			// If latency bigger than "limitIndex" x time then deny request
			if (latency > frequency * limitIndex) {
				return;
			}

			var data = response.data;
			if (typeof data !== 'object') {
				return;
			}

			client.distribution(latency, data);
		}
	});

	// Required time to send all data to client
	var reqtime = size / throughput;
	// Rate to make distribution for this client
	var rate = maxrate * Math.min(expectedLatency / reqtime, 1);

	// How much time left to next distribution
	client.distributionTime = 1000 / rate;
}, 'clients');

function get(name) {
	return wrap[name];
}

function set(name, data) {
	wrap[name] = data;
}

exports.get = get;
exports.set = set;
