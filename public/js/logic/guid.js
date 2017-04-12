const GUIDs = [];
function GUID() {
	function path() {
		return (Math.random() * 8999 + 1000).toFixed(0);
	}
	var key = `${path()}-${path()}-${path()}`;
	if (~GUIDs.indexOf(key)) {
		return GUID();
	}
	else {
		GUIDs.push(key);
		return key;
	}
}

function GUIDclear(id) {
	var index = GUIDs.indexOf(key);
	if (~index) {
		delete GUIDs[index];
	}
}
