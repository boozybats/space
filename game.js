;(function() {
	//requires
	const ws_     = require('./ws');
	const spawner_ = require('./spawner');

	//constants
	const _storage = {};

	ws_.set('items', json => {
		var myid = json.id;

		if (_storage[myid]) {
			var out = {};

			for (var id in _storage) {
				if (_storage.hasOwnProperty(id) && id !== myid) {
					var item = _storage[id];

					out[id] = item;
				}
			}

			json.answer(out);
		}
	});

	ws_.set('mydata', json => {
		var data = json.data;
		var id = json.id;

		var item = _storage[id];
		if (item) {
			item.position = data.position;
			item.matter = data.matter;
		}
	});

	function createID(ip) {
		var id = GUID();

		_storage[id] = {
			ip: ip,
			position: [0, 0, 0],
			matter: {}
		}

		return id;
	}

	ws_.set('id', json => {
		var id = json.data;
		if (id) {
			json.answer(_storage[id] ? id : createID(json.ip));
		}
		else {
			id = createID(json.ip);
			json.answer(id);
		}
	});

	var GUIDs = [];
	function GUID() {
		function path() {
			return (Math.random() * 9999999999).toFixed(0);
		}
		var key = path();
		if (GUIDs.indexOf(key) === -1) {
			GUIDs.push(key);
			return key;
		}
		else {
			return GUID();
		}
	}

	spawner_.spawn({
		array: _storage,
		guid: GUID
	});
})();
