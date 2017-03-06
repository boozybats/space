var server = {
	id: null,
	items: function(callback) {
		this.send({
			callback,
			handler: 'items'
		});
	},
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
	send: function(params) {
		params.id = server.id;
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
