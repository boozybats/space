var cookie = {
    read: function(name) {
        if (typeof name !== 'string') {
            warn('cookie->read', 'name', name);
            return null;
        }

        var result = document.cookie.match(new RegExp(`${name}=([^;]+)`));
        if (result) {
            result = JSON.parse(result[1]);
        }

        return result;
    },
    remove: function(name) {
        if (typeof name !== 'string') {
            warn('cookie->remove', 'name', name);
            return null;
        }

        document.cookie = `${name}=""; expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
    },
    set: function(name, value) {
        if (typeof name !== 'string') {
            warn('cookie->set', 'name', name);
            return null;
        }

        var cookie = `${escape(name)}=${JSON.stringify(value)};`;
        document.cookie = cookie;
    }
};
