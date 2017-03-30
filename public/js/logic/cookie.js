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
