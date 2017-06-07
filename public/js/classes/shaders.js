function Shaders(webGL) {
    this.webGL = webGL;
    var data = new Storage;
    data.filter = (data => data instanceof Shader);
    this.data = data;
}

Shaders.prototype.add = function(name, shaders, options) {
    var shader = new Shader(this.webGL, shaders[0], shaders[1], options);
    this.data.set(name, shader);
}

Shaders.prototype.get = function(name) {
    return this.data.get(name);
}
