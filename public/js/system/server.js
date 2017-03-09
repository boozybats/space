/**
 * Simplify work with websockets to get/send server's data,
 * always sends 'id' as a parametr if defined
 * @type {Object}
 */
const server = {
	id: null,
	items: function(callback) {
		this.send({
			callback,
			handler: 'items'
		});
	},
	// sends player's object's data to server
	mydata: function({
		body
	}) {
		this.send({
			handler: 'mydata',
			data: {
				body: {
					position: body.position.array,
					scale: body.scale.array
				}
			}
		});
	},
	/**
	 * read id from cookie or generate new on server also send
	 * 'id' on server to track activity
	 * Calls callback after successful request
	 */
	getid: function(callback) {
		var id = cookie.read('id');
		ws.send({
			handler: 'id',
			data: id,
			callback: json => {
				server.id = json.data;
				cookie.set('id', server.id);
				callback(id);
			}
		});
	},
	// always adds "id" in data
	send: function(params) {
		if (typeof params.data !== 'object') {
			if (params.data) {
				console.warn('Server: send: data always must be an object or undefined');
			}

			params.data = {
				id: this.id
			};
		}
		else {
			params.data.id = this.id;
		}

		ws.send(params);
	}
};

var cookie = {
	read: function(name) {
		var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
		result && (result = JSON.parse(result[1]));
		return result;
	},
	remove: function(name) {
		document.cookie = `${name}=""; expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
	},
	set: function(name, value) {
		var cooks = document.cookie;
		var date = new Date();
		date.setTime(date.getTime() + (100 * 24 * 3600 * 1000));
		var cookie = `${escape(name)}=${JSON.stringify(value)}; expires=${date.toUTCString()};`;
		document.cookie = cookie;
	}
};
