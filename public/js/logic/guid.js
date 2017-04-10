const GUIDs = [];
function GUID() {
	function path() {
		return (Math.random() * 8999 + 1000).toFixed(0);
	}
	var key = `${path()}-${path()}-${path()}`;
	if (GUIDs.indexOf(key) === -1) {
		GUIDs.push(key);
		return key;
	}
	else {
		return GUID();
	}
}