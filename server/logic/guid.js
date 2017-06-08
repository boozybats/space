const GUIDs = [];
function GUID() {
	function path() {
		return ((Math.random() * 10e+12).toFixed(0) - 0);
	}
	var key = path();
	if (~GUIDs.indexOf(key)) {
		return GUID();
	}
	else {
		GUIDs.push(key);
		return key;
	}
}

function clear(id) {
	var index = GUIDs.indexOf(id);
	if (~index) {
		delete GUIDs[index];
	}
}

exports.gen = GUID;
exports.clear = clear;
