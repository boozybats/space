const http = require('http');
const url = require('url');
const page = require('./page');

const _listener = 80;
const _handlers = {};

;
(function() {
    console.log(`Server listener - ${_listener}`);

    var server = http.createServer(onRequest);
    server.listen(_listener);

    console.log('Server is running');
})();

function onRequest(request, response) {
    // Check on handler then create page if not exists
    var parsed = url.parse(request.url);
    var path = parsed.pathname;
    var post = '';

    if (request.method === 'POST') {
        request.on('data', function(data) {
            post += data;
        });
        request.on('end', function() {
            complete();
        });
    } else {
        complete();
    }

    // Wait post-data or start instantly if get-request
    function complete() {
        var handler = _handlers[path];
        if (handler) {
            handler(request, response, post);
            return;
        }

        page.direct(request, response);
    }
}

function removeHandler(handler) {
    if (_handlers[handler]) {
        delete _handlers[handler];
    }
}

function setHandler(handler, callback) {
    if (typeof callback !== 'function') {
        return;
    }

    _handlers[handler] = callback;
}

exports.setHandler = setHandler;

// Initialize custom actions
require('./custom');
