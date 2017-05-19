function log() {
	console.log.apply(console, arguments);
}

function warn(place, argument, value) {
	log(`Warn: ${place}: ${argument} is specified but corrupted, value: ${value}, type: ${typeof value}`);
}
