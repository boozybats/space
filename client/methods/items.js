const _items = global.storages.items;

function getEachData() {
	var out = [];

	_items.each(function(item) {
		out.push(item.toJSON(['body']));
	});

	return out;
}

exports.getEachData = getEachData;
