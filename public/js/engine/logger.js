function log() {
    console.log.apply(console, arguments);
}

function warn(place, argument, value) {
    log(`Warn: ${place}: "${argument}" is specified but corrupted, type: ${typeof value}, value:`,  value);
}

function warnfree(argument) {
    log(`Warn: ${argument}`);
}

function error(place, argument, value) {
    throw new Error(`${place}: "${argument}" is specified but corrupted, type: ${typeof value}, value:`, value);
}

function errorfree(argument) {
    throw new Error(`${argument}`);
}
