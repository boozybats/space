var isDebugger = true;

function log() {
    if (!isDebugger) {
        return false;
    }

    console.log.apply(console, arguments);
}

function warn(place, argument, value) {
    log(`Warn: ${place}: "${argument}" is specified but corrupted, type: ${typeof value}, value:`, value);
}

function warnfree(argument) {
    log(`Warn: ${argument}`);
}

function error(place, argument, value) {
    log(`Error: ${place}: "${argument}" is specified but corrupted, type: ${typeof value}, value:`, value);
}

function errorfree(argument) {
    log(`Error: ${argument}`);
}

exports.log = log;
exports.warn = warn;
exports.warnfree = warnfree;
exports.error = error;
exports.errorfree = errorfree;
