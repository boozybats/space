class CloneItem {
	constructor(scene, {
		name = 'empty',
		body = new Body,
		collider,
		physic
	} = {}) {
		if (!(scene instanceof Scene)) {
			console.warn('CloneItem: scene isn\'t a Scene');
		}
		else if (typeof name !== "string") {
			console.warn('CloneItem: name isn\'t string');
		}
		else if (!(body instanceof Body)) {
			console.warn('CloneItem: body isn\'t Body');
		}
		else if (collider && !(collider instanceof Collider)) {
			console.warn('CloneItem: collider isn\'t Collider');
		}
		else if (physic && !(physic instanceof Physic)) {
			console.warn('CloneItem: physic isn\'t Physic');
		}

		//this class supports to easily prototype functions

		this.project = scene.project;
		this.scene = scene;
		this.enable = true;
		this.name = name;
		this.body = new Body(body.position, body.rotation, body.scale);
		this.collider = collider;
		this.physic = physic;
	}

	allcollision(items) {
		//check collision with every object

		for (var item of items) {
			if (this !== item) {
				if (this.collision(item)) {
					return item;
				}
			}
		}

		return false;
	}

	get attributes() {
		return this.attributes_;
	}

	set attributes(attributes) {
		if (typeof attributes === 'object') {
			this.attributes_ = this.initializeAttributes(attributes);
		}
		else {
			console.warn('CloneItem: attributes: error');
		}
	}

	get availabeFrames() {
		return this.availableFrames_;
	}

	set availabeFrames(array) {
		if (typeof array === 'object') {
			this.availableFrames_ = array;
		}
		else {
			console.warn('CloneItem: availableFrames: error');
		}
	}

	get body() {
		return this.body_;
	}

	set body(val) {
		if (val instanceof Body) {
			this.body_ = val;
		}
		else {
			console.warn('CloneItem: body: error');
		}
	}

	get collider() {
		return this.collider_;
	}

	set collider(val) {
		if (val instanceof Project) {
			this.collider_ = val;
		}
		else {
			console.warn('CloneItem: collider: error');
		}
	}

	collision(item) {
		if (!(item instanceof CloneItem)) {
			console.warn('CloneItem: collision: error');
		}

		if (this.collider && item.collider) {
			var result = SphereCollider.collision(this, element);  //check to sphere collision
			return result;
		}
		else {
			return false;
		}
	}

	distance(item) {
		if (!(item instanceof CloneItem)) {
			console.warn('CloneItem: distance: error');
		}

		//calculates distance between elements

		var matrix0 = this.mvmatrix,
			matrix1 = item.mvmatrix;

		//centers
		var c0 = matrix0.transform([0,0,0]),
			c1 = matrix1.transform([0,0,0]);

		var d = Math.sqrt(Math.pow(c1[0] - c0[0], 2) + Math.pow(c1[1] - c0[1], 2) + Math.pow(c1[2] - c0[2], 2));

		return d;
	}

	get enable() {
		return this.enable_;
	}

	set enable(val) {
		if (typeof val === 'boolean') {
			this.enable_ = val;
		}
		else {
			console.warn('CloneItem: enable: error');
		}
	}

	initializeAttributes(attributes) {
		if (typeof attributes !== 'object') {
			console.warn('CloneItem: initializeAttributes: error');
		}

		//returns all buffers, which has been sended as arguments
		//writes buffers at WebGL storage
		//gets associative massive format: Array[0,1,2,3] => size=x

		var gl = this.project.webGLRenderer.webGL;
		var shader = this.shader;

		var attributesArray = [];

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				var attribute = attributes[i];
				var buffer = gl.createBuffer();

				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribute), gl.STATIC_DRAW);

				var attr = [gl.getAttribLocation(shader, i), attribute.size];  //sends attribute to shader
				if (attr[0] >= 0) {  //if shader contain attribute
					gl.vertexAttribPointer(attr[0], attr[1], gl.FLOAT, false, 0, 0);
					gl.enableVertexAttribArray(attr[0]);

					attributesArray.push([buffer, attr]);
				}
				else {
					console.warn(`Shader doesnt contain ${i} attribute or this attribute unusable`);
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}

		return attributesArray;
	}

	initializeVertexIndices(indices) {
		if (typeof indices !== 'object'){
			console.warn('CloneItem: initializeVertexIndices: error');
		}

		var gl = this.project.webGLRenderer.webGL;
		var VIOBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		VIOBuffer.number = indices.length;

		return VIOBuffer;
	}

	initializeTextures(TexturesList) {
		if (TexturesList && typeof TexturesList !== 'object') {
			console.warn('CloneItem: initializeTextures: error');
		}

		if (!TexturesList) {
			return true;
		}

		var gl = this.project.webGLRenderer.webGL;
		var out = [];
		var shader = this.shader;

		gl.useProgram(shader);

		for (var i in TexturesList) {
			//goes throw all uniforms and update in shader

			if (TexturesList.hasOwnProperty(i)) {
				var texture = TexturesList[i];
				if (texture instanceof Array) {
					for (var z = 0; z < texture.length; z++) {
						//creates new image buffer data

						var image = texture[z];
						var n_texture = gl.createTexture();

						if (!image.src) {
							console.warn('CloneItem: initializeTextures: one of images without src');
						}

						gl.bindTexture(gl.TEXTURE_2D, n_texture);
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.bindTexture(gl.TEXTURE_2D, null);

						gl.activeTexture(gl.TEXTURE0 + z);
						gl.bindTexture(gl.TEXTURE_2D, n_texture);
						gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

						out.push([n_texture, z]);
					}

					//collection function of all textures

					var uniform = gl.getUniformLocation(shader, i);
					var samplerArray = new Int32Array(texture.length);
					var length = samplerArray.length;

					while(length--) {
						samplerArray[length] = length;
					}

					gl.uniform1iv(uniform, samplerArray);
				}
				else {
					var image = texture;
					var texture = gl.createTexture();

					if (!image.src) {
						console.warn('CloneItem: initializeTextures: image without src');
					}

					//binding single image to send in shader

					gl.bindTexture(gl.TEXTURE_2D, texture);
					var uniform = gl.getUniformLocation(shader, i);
					gl.uniform1i(uniform, 0);
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
					gl.bindTexture(gl.TEXTURE_2D, null);

					out.push([texture, 0]);
				}
			}
		}

		return out;
	}

	get mvmatrix() {
		var matS, matR, matT, mvmatrix;
		var body = this.body;

		do {
			matS = Mat4.scale(body.scale);
			matR = Mat4.rotate(body.rotation);
			matT = Mat4.translate(body.position);
			mvmatrix = mvmatrix ? Mat.multi(mvmatrix, matS, matR, matT) : Mat.multi(matS, matR, matT);

			body = body.parent;
		}
		while(body);

		return mvmatrix;
	}

	get name() {
		return this.name_;
	}

	set name(val) {
		if (typeof val === 'string') {
			this.name_ = val;
		}
		else {
			console.warn('CloneItem: name: error');
		}
	}

	get project() {
		return this.project_;
	}

	set project(val) {
		if (val instanceof Project) {
			this.project_ = val;
		}
		else {
			console.warn('CloneItem: project: error');
		}
	}

	get shader() {
		return this.shader_;
	}

	set shader(shader) {
		if (shader instanceof Shader) {
			var webGL = this.scene.project.webGLRenderer.webGL;
			this.shader_ = shader.initializeShader(webGL);
		}
		else {
			console.warn('CloneItem: setShader: error');
		}
	}

	get textures() {
		return this.textures_;
	}

	set textures(texturesList) {
		if (texturesList) {
			if (typeof texturesList !== 'object') {
				console.warn('CloneItem: setTextures: error');
			}

			//change or create new list of textures to clone element
			//textures could be changed at parent element

			var self = this;
			(function cycle() {
				for (var y in texturesList) {
					if (texturesList.hasOwnProperty(y)) {
						var texture = texturesList[y];
						for (var image of texture) {
							if (image.constructor != ItemImage) {
								console.warn("Textures sended to shader must be created by ItemImage function");
							}

							if (!image.loaded) {
								setTimeout(cycle, 100);
								return;
							}
						}
					}
				}

				self.textures_ = self.initializeTextures(texturesList);
			})();
		}
		else {
			console.warn('CloneItem: textures: error');
		}
	}

	updateAttributes() {
		if (!this.project.webGLRenderer) {
			console.warn('CloneItem: updateAttributes: error');
		}

		//updates element attributes

		var gl = this.project.webGLRenderer.webGL;
		var shader = this.shader;
		var attributes = this.attributes;

		if (attributes) {
			for (var attr of attributes) {
				var buffer = attr[0];
				var attribute = attr[1];

				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

				gl.vertexAttribPointer(attribute[0], attribute[1], gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(attribute[0]);

				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}
	}

	updateShaderUniformArray(uniforms, name) {
		if (!(uniforms instanceof Array)) {
			console.warn('CloneItem: updateShaderUniformArray: uniforms isn\'t an array');
		}
		else if (typeof name != "string") {
			console.warn('CloneItem: updateShaderUniformArray: name ins\'t a string');
		}

		//send the array in shader
		//shader get array as "type u_Variable[x]", where x - size of array

		var gl = this.project.webGLRenderer.webGL;
		var shader = this.shader;
		var type = uniforms[0].constructor;  //define type of first element

		//THIS ONE DOESN'T WORK!
	}

	updateShaderUniforms(uniforms, shader = this.shader) {
		if (uniforms && typeof uniforms != 'object') {
			console.warn('CloneItem: updateShaderUniforms: uniforms isn\'t an object');
		}
		
		if (!uniforms) {
			return true;
		}

		//update shader uniforms
		//this function can be called once for one shader, and only usable to update uniforms data

		var gl = this.project.webGLRenderer.webGL;
		var shader = shader;

		gl.useProgram(shader);

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var uniform = uniforms[i];

				if (typeof uniform === "function") {
					continue;
				}
				else if (uniform instanceof Array) {
					this.updateShaderUniformArray(uniform, i);
					continue;
				}

				//unavailable to send images
				if (uniform.src) {
					console.warn('Uniforms can\'t containt image objects, put texture in mesh, 3-rd argument, key: Textures');
				}

				var _uniform = gl.getUniformLocation(shader, i);
				var type, str;

				//step to define type of uniform
				//uniform could have next types:
				//mat, vec, float

				if (uniform instanceof Mat) {
					type = "mat";

					switch(uniform.a) {
						case 2:
							str = 'uniformMatrix2fv';
							break;

						case 3:
							str = 'uniformMatrix3fv';
							break;

						case 4:
							str = 'uniformMatrix4fv';
							break;
					}
				}
				else if (uniform instanceof Vec) {
					type = "vec";

					switch(str) {
						case vec2:
							str = 'uniform2fv';
							break;

						case vec3:
							str = 'uniform3fv';
							break;

						case vec4:
							str = 'uniform4fv';
							break;
					}
				}
				else if (typeof uniform === 'number') {
					type = 'float';
				}

				//sending uniforms by special functions at WebGL

				if (type == 'vec') {
					gl[str](_uniform, new Float32Array(uniform.inline()));
				}
				else if (type == 'mat') {
					gl[str](_uniform, false, new Float32Array(uniform.inline()));
				}
				else if (type == 'float') {
					gl.uniform1fv(_uniform, uniforms[i]);
				}
			}
		}
	}

	updateTextures() {
		var gl = this.project.webGLRenderer.webGL;
		var textures = this.textures;

		if (textures) {
			for (var texture of textures) {
				gl.activeTexture(gl.TEXTURE0 + texture[1]);
				gl.bindTexture(gl.TEXTURE_2D, texture[0]);
			}
		}
	}

	set vertexIndices(VI) {
		if (typeof VI === "object") {
			this.VIOBuffer = this.initializeVertexIndices(VIArray);
		}
		else {
			console.warn('CloneItem: vertexIndices: error');
		}
	}

	get VIOBuffer() {
		return this.VIOBuffer_;
	}

	set VIOBuffer(val) {
		if (typeof val === 'object') {
			this.VIOBuffer_ = val;
		}
		else {
			console.warn('CloneItem: VIOBuffer: error');
		}
	}
}

CloneElement.prototype.;