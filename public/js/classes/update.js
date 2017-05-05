/**
 * After instantiation "Update" starts iterations with specified
 * frequency. Executes all added callbacks by each iteration.
 * It helps to optimize process and not create many of timers.
 */

class Update {
	constructor({
		frequency = 1000 / 60
	} = {}) {
		this.frequency = frequency;

		// Callbacks will be executed by each frame
		this.callbacks = {
			start: new Storage
		};
		this.callbacks.start.filter = (data => typeof data === 'function');

		this.initialize();
	}

	get frequency() {
		return this.frequency_;
	}
	set frequency(val) {
		if (typeof val !== 'number') {
			console.warn(`Update: frequency: must be a number, type: ${typeof val}, value: ${val}`);
			val = 1000 / 60;
		}

		this.frequency_ = val;
	}

	/* Setup update function by frequency, all added callbacks will be called once
	per frame. Can be selected area of update:
	start - call on update iteration start */
	initialize() {
		var callbacks = this.callbacks,
			frequency = this.frequency;

		var o_time = Date.now();
		;(function update() {
			// current time
			var n_time = Date.now();
			// difference between old and new times
			var delta = n_time - o_time;

			callbacks.start.each(callback => {
				callback({
					time: n_time,
					deltaTime: delta
				});
			});

			o_time = n_time;
			
			setTimeout(update, frequency);
		})();
	}

	/**
	 * Sets new callback in choosen area.
	 */
	push(callback, area = 'start') {
		var arr = this.callbacks[area];
		if (!arr) {
			return false;
		}

		var index = arr.push(callback) - 1;

		return index;
	}

	remove(index, area = 'start') {
		var arr = this.callbacks[area];
		if (!arr) {
			return false;
		}

		return arr.remove(index);
	}
}
