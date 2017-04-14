var cookie = {
	read: function(name) {
		if (typeof name !== 'string') {
			console.warn(`Cookie: read: "name" must be a string, value: ${name}`);
			return null;
		}

		var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
		if (result) {
			result = JSON.parse(result[1]);
		}

		return result;
	},
	remove: function(name) {
		if (typeof name !== 'string') {
			console.warn(`Cookie: read: "name" must be a string, value: ${name}`);
			return null;
		}

		document.cookie = `${name}=""; expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
	},
	set: function(name, value) {
		if (typeof name !== 'string') {
			console.warn(`Cookie: read: "name" must be a string, value: ${name}`);
			return null;
		}
		
		var cooks = document.cookie;
		var date = new Date();
		date.setTime(date.getTime() + (100 * 24 * 3600 * 1000));
		var cookie = `${escape(name)}=${JSON.stringify(value)}; expires=${date.toUTCString()};`;
		document.cookie = cookie;
	}
};
