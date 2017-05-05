// Distributes clients on several sectors to avoid overload of server

var update = require('./update');

const serversCount = 1;
var serversEnabled = 1;
var clients = 0;

// Monitors servers overload and chnges configuration for situation
;(function() {
	// How much times frequency x times bigger than default value
	var overloads = 0;
	// How much overloads will be ignored
	var overloadsAllowed = 5;
	// Overload koefficient
	var multiplier = 1.5;

	update.push(function({
		deltaTime
	}) {
		var frequency = update.getFrequency();

		// If delta time bigger than default frequency by x times
		if (deltaTime > frequency * multiplier) {
			// If overload times bigger than overloads allowed at all
			if (overloads > overloadsAllowed) {
				overloads = 0;

				/* If servers count bigger than enabled servers then enable
				new one */
				if (serversEnabled < serversCount) {
					serversEnabled++;
				}
			}
			else {
				overloads++;
			}
		}
		else {
			overloads = 0;
		}
	});
})();

function appendClient(client) {
	clients++;
	updateSystem();
}

exports.appendClient = appendClient;

// TODO: вырубать сервера, если нагрузка низкая
