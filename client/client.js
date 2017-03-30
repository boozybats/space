const Storage = require('./storage');

global.storages = {
	players: new Storage(),
	items: new Storage()
};

require('./player');
require('./items');
