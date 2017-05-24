function log() {
    console.log.apply(console, arguments);
}

function warn(place, argument, value) {
    log(`Warn: ${place}: ${argument} is specified but corrupted, value: ${value}, type: ${typeof value}`);
}

function warnfree(argument) {
    log(`Warn: ${argument}`);
}

function error(place, argument, value) {
    throw new Error(`Error: ${place}: ${argument} is specified but corrupted, value: ${value}, type: ${typeof value}`);
}

function errorfree(argument) {
    throw new Error(`Error: ${argument}`);
}
