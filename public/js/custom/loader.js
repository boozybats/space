/**
 * Loads all sended images and after loading
 * calls callback function with sended object
 * @param  {object}   images
 * @param  {Function} callback
 *
 * callback example: function({space: Image, computer: Image});
 */
function loader(images, callback) {
	var out = {};
	var total = 0;
	var loaded = 0;

	function onload() {
		if (total <= ++loaded) {
			callback(out);
		}
	}

	function onerror() {
		console.warn(`image '${this.src}' error`);
	}

	for (let i in images) {
		total++;
		if (images.hasOwnProperty(i)) {
			var image = new Image();
			out[i] = image;

			image.onload = onload;
			image.onerror = onerror;
			image.src = images[i];
		}
	}
}
