;(function() {
	//requires
	const fs_   = require('fs');
	const url_  = require('url');
	const path_ = require('path');

	//constants
	const _mainpages = ['index.html'];
	const _public    = 'public';

	function redirect(request, response) {
		if (typeof request === 'object' && typeof response === 'object') {
			var parsed = url_.parse(request.url);
			var path   = parsed.pathname;
			var query  = parsed.query;
			validpath(path, (err, redirect, path) => {
				if (err) {
					error(err, response);
				}
				else if (redirect) {
					if (typeof redirect === 'string') {
						response.writeHead(302, {
							'Content-Type': 'text/plain',
							'Location': `${redirect}${query?('?'+query):''}`
						});
						response.write('Redirecting...');
						response.end();
					}
				}
				else {
					create(path, response);
				}
			});
		}
	}

	function validpath(path, callback) {
		if (typeof path === 'string' && typeof callback === 'function') {
			if (path.match(/\/$/)) {
				(function bust(i) {
					if (_mainpages[i]) {
						var n_path = `${path}${_mainpages[i]}`;
						var fullpath = `${_public}${n_path}`;
						fs_.stat(fullpath, err => {
							if (err) {
								bust(++i);
							}
							else {
								callback(null, null, fullpath);
							}
						});
					}
					else {
						var n_path = path.replace(/\/$/, '');
						var fullpath = `${_public}${n_path}`;
						fs_.stat(fullpath, err => {
							if (err) {
								var h_path = `${fullpath}.html`;
								fs_.stat(h_path, (err) => {
									if (err) {
										callback(404, null, null);
									}
									else {
										callback(null, n_path, h_path);
									}
								});
							}
							else {
								callback(null, n_path, fullpath);
							}
						});
					}
				})(0);
			}
			else {
				var fullpath = `${_public}${path}`;
				fs_.stat(fullpath, err => {
					if (err) {
						var n_path = `${fullpath}.html`;
						fs_.stat(n_path, (err) => {
							if (err) {
								callback(404, null, null);
							}
							else {
								callback(null, null, n_path);
							}
						});
					}
					else {
						callback(null, null, fullpath);
					}
				});
			}
		}
	}

	function error(num, response) {
		if (typeof response === 'object') {
			var content;
			switch (num) {
				case 404:
				content = '404 Not Found';
				break;

				case 500:
				content = '500 Internal Server Error';

				default:
				return;
			}

			var errorpage = `${_public}/${num}.html`;
			fs_.readFile(errorpage, (err, data) => {
				if (err) {
					if (typeof num === 'number' && typeof content === 'string') {
						response.writeHead(num, {
							'Content-Type': 'text/plain'
						});
						response.write(content);
						response.end();
					}
				}
				else {
					if (data.toString) {
						data = data.toString();
					}
					if (typeof num === 'number' && typeof data === 'string') {
						response.writeHead(num, {
							'Content-Type': 'text/html'
						});
						response.write(data);
						response.end();
					}
				}
			});
		}
	}

	function create(path, response) {
		if (typeof path === 'string' && typeof response === 'object') {
			var contenttype;
			var ext = path_.extname(path);
			switch(ext) {
				case '.html':
				contenttype = 'text/html';
				break;

				case '.xml':
				contenttype = 'text/xml';
				break;

				case '.php':
				contenttype = 'text/php';
				break;

				case '.jpg':
				case '.jpeg':
				contenttype = 'image/jpeg';
				break;

				case '.png':
				contenttype = 'image/png';
				break;

				case '.gif':
				contenttype = 'image/gif';
				break;

				case '.svg':
				contenttype = 'image/svg+xml';
				break;

				case '.ogg':
				contenttype = 'video/ogg';
				break;

				case '.mpeg':
				contenttype = 'video/mpeg';
				break;

				case '.mp4':
				contenttype = 'video/mp4';
				break;

				case '.webm':
				contenttype = 'video/webm';
				break;

				case '.aac':
				contenttype = 'audio/aac';
				break;

				case '.vorbis':
				contenttype = 'audio/vorbis';
				break;

				case '.wav':
				case '.flac':
				contenttype = 'audio/vnd.wave';
				break;

				case '.lossless':
				case '.mp3':
				case '.wma':
				contenttype = 'audio/basic';
				break;

				case '.js':
				contenttype = 'text/javascript';
				break;

				case '.css':
				contenttype = 'text/css';
				break;

				default:
				contenttype = 'text/plain';
			}

			fs_.readFile(path, (err, data) => {
				if (err) {
					error(500, response);
				}
				else {
					if (typeof contenttype === 'string') {
						function call() {
							response.writeHead(200, {
								'Content-Type': contenttype
							});
							response.write(data);
							response.end();
						}

						try {
							call();
						}
						catch (e) {
							if (data.toString) {
								data = data.toString();
								call();
							}
						}
					}
				}
			});
		}
	}

	//exports
	exports.redirect = redirect;
})();
