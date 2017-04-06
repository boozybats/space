const _items = global.storages.items;

function getEachData() {
	var out = [];

	_items.each(function(item) {
		out.push(item.toJSON());
	});

	return out;
}

exports.getEachData = getEachData;
