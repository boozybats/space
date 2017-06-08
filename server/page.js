const fs = require('fs');
const url = require('url');
const path = require('path');

const _mainpages = ['index.html'];
const _public = '../public';
const _handlers = {
    beforeUnload: []
};

function direct(request, response) {
    if (typeof request === 'object' && typeof response === 'object') {
        var parsed = url.parse(request.url);
        var path = parsed.pathname;
        var query = parsed.query;
        validpath(path, (err, npath, path) => {
            if (err) {
                error(err, response);
            } else if (typeof npath === 'string') {
                var path = `${npath}${query ? ('?' + query) : ''}`;
                redirect(path, request, response);
            } else {
                create(path, request, response);
            }
        });
    }
}

function redirect(path, request, response) {
    write('Redirecting...', {
        'Content-Type': 'text/plain',
        'Location': path
    }, response, 302);
}

function validpath(path, callback) {
    if (typeof path === 'string' && typeof callback === 'function') {
        if (path.match(/\/$/)) {
            (function flow(i) {
                if (_mainpages[i]) {
                    var n_path = `${path}${_mainpages[i]}`;
                    var fullpath = `${_public}${n_path}`;
                    fs.stat(fullpath, err => {
                        if (err) {
                            flow(++i);
                        } else {
                            callback(null, null, fullpath);
                        }
                    });
                } else {
                    var n_path = path.replace(/\/$/, '');
                    var fullpath = `${_public}${n_path}`;
                    fs.stat(fullpath, err => {
                        if (err) {
                            var h_path = `${fullpath}.html`;
                            fs.stat(h_path, (err) => {
                                if (err) {
                                    callback(404, null, null);
                                } else {
                                    callback(null, n_path, h_path);
                                }
                            });
                        } else {
                            callback(null, n_path, fullpath);
                        }
                    });
                }
            })(0);
        } else {
            var fullpath = `${_public}${path}`;
            fs.stat(fullpath, err => {
                if (err) {
                    var n_path = `${fullpath}.html`;
                    fs.stat(n_path, (err) => {
                        if (err) {
                            callback(404, null, null);
                        } else {
                            callback(null, null, n_path);
                        }
                    });
                } else {
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
        fs.readFile(errorpage, (err, data) => {
            if (err) {
                if (typeof num === 'number' && typeof content === 'string') {
                    write(content, {
                        'Content-Type': 'text/plain'
                    }, response, num);
                }
            } else {
                if (data.toString) {
                    data = data.toString();
                }
                if (typeof num === 'number' && typeof data === 'string') {
                    write(data, {
                        'Content-Type': 'text/html'
                    }, response, num);
                }
            }
        });
    }
}

function create(path, request, response) {
    if (typeof path === 'string' && typeof response === 'object') {
        var headers = {};
        var ext = path.extname(path);
        switch (ext) {
            case '.html':
                headers['Content-Type'] = 'text/html';
                break;

            case '.xml':
                headers['Content-Type'] = 'text/xml';
                break;

            case '.php':
                headers['Content-Type'] = 'text/php';
                break;

            case '.jpg':
            case '.jpeg':
                headers['Content-Type'] = 'image/jpeg';
                break;

            case '.png':
                headers['Content-Type'] = 'image/png';
                break;

            case '.gif':
                headers['Content-Type'] = 'image/gif';
                break;

            case '.svg':
                headers['Content-Type'] = 'image/svg+xml';
                break;

            case '.ogg':
                headers['Content-Type'] = 'video/ogg';
                break;

            case '.mpeg':
                headers['Content-Type'] = 'video/mpeg';
                break;

            case '.mp4':
                headers['Content-Type'] = 'video/mp4';
                break;

            case '.webm':
                headers['Content-Type'] = 'video/webm';
                break;

            case '.aac':
                headers['Content-Type'] = 'audio/aac';
                break;

            case '.vorbis':
                headers['Content-Type'] = 'audio/vorbis';
                break;

            case '.wav':
            case '.flac':
                headers['Content-Type'] = 'audio/vnd.wave';
                break;

            case '.lossless':
            case '.mp3':
            case '.wma':
                headers['Content-Type'] = 'audio/basic';
                break;

            case '.js':
                headers['Content-Type'] = 'text/javascript';
                break;

            case '.css':
                headers['Content-Type'] = 'text/css';
                break;

            default:
                headers['Content-Type'] = 'text/plain';
        }

        var wrap = {
            isSevered: false,
            ext: ext,
            headers: headers,
            path: path
        };
        fireEvent('beforeUnload', [wrap, request, response]);

        if (wrap.isSevered) {
            return;
        }

        fs.readFile(wrap.path, (err, data) => {
            if (err) {
                error(500, response);
            } else {
                if (!write(data, wrap.headers, response)) {
                    if (data.toString) {
                        data = data.toString();

                        write(data, wrap.headers, response);
                    }
                }
            }
        });
    }
}

function write(data, headers, response, code) {
    try {
        response.writeHead(code || 200, headers);
        response.write(data);
        response.end();

        return true;
    } catch (err) {
        if (err) {
            return false;
        }
    }
}

function attachEvent(handler, callback) {
    var handler = _handlers[handler];

    if (handler) {
        if (typeof callback === 'function') {
            return 'handler ' + (handler.push(callback) - 1);
        }
    }

    return false;
}

function detachEvent(handler) {
    var splited = handler.split(' ');
    var name = splited[0],
        index = splited[1];

    var handler = _handlers[name];

    if (handler && handler[index]) {
        delete handler[index];
    }
}

function fireEvent(handler, args) {
    var handlers = _handlers[handler];

    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(handlers[i], args);
        }
    }
}

//exports
exports.direct = direct;
exports.redirect = redirect;
exports.write = write;
exports.attachEvent = attachEvent;
exports.detachEvent = detachEvent;
exports.fireEvent = fireEvent;
