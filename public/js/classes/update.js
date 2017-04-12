class Update {
	constructor({
		frequency = 1000 / 60
	} = {}) {
		this.frequency = frequency;

		// Callbacks will be executed by each frame
		this.callbacks = {
			main: new Storage
		};
		this.callbacks.main.filter = (data => typeof data === 'function');

		this.initialize();
	}

	get frequency() {
		return this.frequency_;
	}
	set frequency(val) {
		if (typeof val !== 'number') {
			throw new Error('Update: must be a number');
		}

		this.frequency_ = val;
	}

	initialize() {
		var callbacks = this.callbacks,
			frequency = this.frequency;

		/* Setup update function by frequency, all added callbacks will be called once
		per frame. Can be selected area of update:
		main - call once per update */
		var o_time = Date.now();
		;(function update() {
			var n_time = Date.now();
			var delta = n_time - o_time;

			callbacks.main.each(callback => {
				callback({
					time: n_time,
					deltaTime: delta
				});
			});

			o_time = n_time;
			
			setTimeout(update, frequency);
		})();
	}

	push(callback, area = 'main') {
		var arr = this.callbacks[area];
		if (!arr) {
			return false;
		}

		var index = arr.push(callback) - 1;

		return index;
	}

	remove(index, area = 'main') {
		var arr = this.callbacks[area];
		if (!arr) {
			return false;
		}

		return arr.remove(index);
	}
}
