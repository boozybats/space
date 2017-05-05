const update = require('../logic/update');

const _items = global.storages.items;

;(function() {
	update.push(function({
		time,
		deltaTime,
		item
	}) {
		item.frameUpdate({
			time: time,
			deltaTime: deltaTime
		});
	}, 'items');
})();

function getEachData() {
	var out = [];

	_items.each(function(item) {
		out.push(item.toJSON(['body']));
	});

	return out;
}

exports.getEachData = getEachData;
