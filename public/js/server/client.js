/**
 * User's connection to websocket.
 */
class Client {
	constructor({} = {}) {
		// Handlers is storage for ANSWER-callbacks by front end
		this.handlers = [];

		/* Free handlers array contains numbers of empty array-positions,
		it needs for optimization: handlers array will not be inifnite big,
		freehandlers will fill empty key-positions */
		this.freehandlers = [];

		// To bind on empty handlers
		this.anonymousfunction = function() {};
	}

	// Executes handler and remove, is called by answer
	execHandler(index, data) {
		var handler = this.handlers[index];
		if (typeof handler !== 'function') {
			return false;
		}

		handler(data);

		this.removeHandler(index);

		return true;
	}

	isHandler(index) {
		return (typeof this.handlers[index] !== 'undefined');
	}

	removeHandler(index) {
		if (typeof this.handlers[index] !== 'function') {
			return false;
		}

		this.handlers[index] = this.anonymousfunction;
		this.freehandlers.push(index);

		return true;
	}

	// Sets answer-callback
	setHandler(callback) {
		if (typeof callback !== 'function') {
			return false;
		}

		var index = this.freehandlers[0];
		if (typeof index === 'number') {
			this.handlers[index] = callback;
			this.freehandlers.splice(0, 1);
		}
		else {
			index = this.handlers.push(callback) - 1;
		}

		return index;
	}
}
