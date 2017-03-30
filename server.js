const http_ = require('http');
const page_ = require('./page');
require('./client/client');

const _listener = 5610;

console.log(`Server listener - ${_listener}`);

function onRequest(request, response) {
	page_.redirect(request, response);
}
var server = http_.createServer(onRequest);
server.listen(_listener);

console.log('Server is running');
