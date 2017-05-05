const update       = require('../logic/update');
const guid         = require('../logic/guid');
const info         = require('../logic/info');
const Heaven       = require('../classes/heaven');
const distribution = require('./distribution');

const _items = global.storages.items;
const _npcs   = global.storages.npcs;

// Create asteroids in time interval
var interval = 5000;
// Asteroids count to instance
var count    = 5;
var lifetime = 30000;

var lastupdate = 0;
update.push(function({
	time,
	deltaTime
}) {
	// Remove items by life time and add event to distribution
	var removed = [];
	_npcs.each(item => {
		if (item.instanceTime + lifetime < time) {
			removed.push(item.id);
			item.remove();
		}
	});

	var arr = distribution.get('remove');
	if (arr instanceof Array) {
		removed = arr.concat(removed);
	}
	distribution.set('remove', removed);

	if (lastupdate + interval > time) {
		return;
	}

	// Instance asteroids for each level
	var levels = info.levels;
	for (var i = 0; i < levels; i++) {
		for (var j = 0; j < count; j++) {
			instance(i, time);
		}
	}

	lastupdate = time;
});

function instance(level, time) {
	var id = guid.gen();
	var heaven = new Heaven({
		id
	});

	heaven.instanceTime = time;
	heaven.generateNPCData(level);
	heaven.onremove = function() {
		_items.remove(id);
		_npcs.remove(id);
		guid.clear(id);
	}

	_items.set(id, heaven);
	_npcs.set(id, heaven);

	return heaven;
}
