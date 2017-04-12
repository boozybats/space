const Update = {};

;(function() {
	// Frequency of update
	var frequency = 1000 / 60;

	// Callbacks will be executed by each frame
	const callbacks = {
		main: new Storage
	};
	callback.main.filter = (data => typeof data === 'function');

	/* Setup update function by frequency, all added callbacks will be called once
	per frame. Can be selected area of update:
	main - call once per update */
	;(function() {
		var o_time = Date.new();
		setInterval(() => {
			var n_time = Date.new();
			var delta = n_time - o_time;

			callbacks.main.each(callback => {
				callback({
					time: n_time,
					deltaTime: delta
				});
			});

			o_time = n_time;
		}, frequency);
	})();

	Update.push = function(callback, area = 'main') {
		var arr = callback[area];
		if (!arr) {
			return false;
		}

		var index = arr.push(callback) - 1;

		return index;
	}

	Update.remove = function(index, area = 'main') {
		var arr = callback[area];
		if (!arr) {
			return false;
		}

		return arr.remove(index);
	}
)();
