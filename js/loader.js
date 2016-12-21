class Loader{
	static images(array, callback) {
		var out = {};
		var total = 0;
		var loaded = 0;

		function onload() {
			if (total <= ++loaded) {
				callback(out);
			}
		}

		for (let i in array) {
			total++;
			if (array.hasOwnProperty(i)) {
				var image = new Image();
				out[i] = image;

				image.onload = onload;
				image.src = array[i];
			}
		}
	}
}
