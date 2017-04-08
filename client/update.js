const FPS = 1000 / 60;
const callbacks = [];

;(function() {
	setInterval(() => {
		for (var i = callbacks.length; i--;) {
			callbacks[i]();
		}
	}, FPS);
})();

function push(callback) {
	if (typeof callback !== 'function') {
		return;
	}

	var index = callbacks.push(callback) - 1;

	return index;
}

exports.push = push;
