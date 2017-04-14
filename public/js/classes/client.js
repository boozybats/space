/**
 * User's connection to websocket.
 */
class Client {
	constructor({} = {}) {
		// Handlers is storage for ANSWER-callbacks by server
		this.handlers = [];

		/* Free handlers array contains numbers of empty array-positions,
		it needs for optimization: handlers array will not be inifnite big,
		freehandlers will fill empty key-positions */
		this.freehandlers = [];
	}

	// Executes handler and remove, is called by answer
	execHandler(key, data) {
		if (!this.isHandler(key)) {
			return false;
		}

		var handler = this.handlers[key];
		handler.callback(data);

		this.removeHandler(key);

		return true;
	}

	isHandler(key) {
		return (this.handlers[key] instanceof Handler);
	}

	/**
	 * Removes excpired handlers.
	 * @param  {Number} date Current time (in miliseconds)
	 */
	removeExpiredHandlers(date) {
		if (typeof date !== 'number') {
			console.one('removeExpiredHandlers', () => {
				console.log(`Client: removeExpiredHandlers: uncorrect "date" sended, type: ${typeof date}, value: ${date}`);
			});

			return;
		}

		for (var i = 0; i < this.handlers.length; i++) {
			if (!this.isHandler(i)) {
				continue;
			}

			var handler = this.handlers[i];
			if (!handler.startLifetime) {
				handler.startLifetime = date;
			}

			if (date > handler.startLifetime + handler.lifetime) {
				this.removeHandler(i);
			}
		}
	}

	removeHandler(key) {
		if (!this.isHandler(key)) {
			return false;
		}

		delete this.handlers[key];
		this.freehandlers.push(key);

		return true;
	}

	// Sets answer-callback
	setHandler(callback, {
		lifetime = 15000
	} = {}) {
		if (typeof callback !== 'function') {
			console.warn(`Client: setHandler: "callback" must be a function, type: ${typeof callback}, value: ${callback}, lifetime: ${lifetime}`);
			return false;
		}
		else if (typeof lifetime !== 'number') {
			console.warn(`Client: setHandler: "lifetime" must be a number, type: ${typeof lifetime}, value: ${lifetime}, callback: ${callback.toString()}`);
			lifetime = 15000;
		}

		var handler = new Handler({
			callback: callback,
			lifetime: lifetime
		});

		var index = this.freehandlers[0];
		if (typeof index === 'number') {
			this.handlers[index] = handler;
			this.freehandlers.splice(0, 1);
		}
		else {
			index = this.handlers.push(handler) - 1;
		}

		return index;
	}
}

// Helps to understand when callback expires
class Handler {
	constructor({
		callback,
		lifetime = 0,
		startLifetime = 0
	}) {
		this.callback = callback;
		this.lifetime = lifetime;
		this.startLifetime = startLifetime;
	}

	get callback() {
		return this.callback_;
	}
	set callback(val) {
		if (typeof val !== 'function') {
			console.log(`Handler: callback: must be a function, type: ${typeof val}, value: ${val}`);
			val = function() {};
		}

		this.callback_ = val;
	}

	get lifetime() {
		return this.lifetime_;
	}
	set lifetime(val) {
		if (typeof val !== 'number') {
			console.log(`Handler: lifetime: must be a number, type: ${typeof val}, value: ${val}`);
			val = 0;
		}

		this.lifetime_ = val;
	}

	get startLifetime() {
		return this.startLifetime_;
	}
	set startLifetime(val) {
		if (typeof val !== 'number') {
			console.log(`Handler: startLifetime: must be a number, type: ${typeof val}, value: ${val}`);
			val = 0;
		}

		this.startLifetime_ = val;
	}
}
