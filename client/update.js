const Storage = require('../storage');
var FPS = 1000 / 60;

// callbacks will be executed by each frame
const callbacks = new Storage;
callbacks.filter = function(data) {
	return (typeof data === 'function');
}

;(function() {
	setInterval(() => {
		callbacks.each(callback => {
			callback();
		});
	}, FPS);
})();

function push(callback) {
	return callbacks.push(callback);
}

exports.push = push;
