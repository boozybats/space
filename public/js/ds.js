	activeTexture(ind, buf) {
		gl.activeTexture(gl.TEXTURE0 + ind);
		gl.bindTexture(gl.TEXTURE_2D, buf);
	}

	addTexture(image) {
		var shader = this.shader;
		var ind = shader.texturesCount++;

		var buffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, buffer);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.project.transparentImage);
		gl.bindTexture(gl.TEXTURE_2D, null);

		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, buffer);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		image.src = image.src;

		shader.textures[ind] = buffer;
		return ind;
	}

	changeAttributes(obj = {}) {
		var shader = this.shader;

		for (var i in obj) {
			if (val.hasOwnProperty(i)) {
				var val = obj[i];

				this.initializeAttribute(i, val, shader.attributes);
			}
		}
	}

	changeUniforms(obj = {}) {
		var shader = this.shader;

		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				var val = obj[i];

				this.initializeUniform(i, val, shader.uniforms);
			}
		}
	}

	initializeAttribute(key, val, out) {
		if (out[key] && amc('=', out[key].value, val)) {
			return;
		}

		var gl = this.webGL;
		var shader = this.shader,
			program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		var size = val.size;
		if (typeof size === 'undefined') {
			console.warn(`Not selected size for attribute '${key}'`);
		}

		var location = gl.getAttribLocation(program, key);
		if (location < 0) {
			//console.warn(`Shader doesnt contain '${name}' attribute or this is unusable`);
		}

		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(val), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		out[key] = {
			buffer,
			location,
			size
		};
	}

	initializeUniform(key, val, out) {
		if (out[key] && amc('=', out[key].value, val)) {
			return;
		}

		var gl = this.webGL;
		var shader = this.shader,
			program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		function getlocation() {
			return gl.getUniformLocation(program, key);
		}

		var location,
			method,
			type,
			value = val;

		if (value instanceof Mat) {
			var num = value.a;
			method = `uniformMatrix${num}fv`;
			type = 'mat';
			location = getlocation();
		}
		else if (value instanceof Vec) {
			var num = value.size;
			method = `uniform${num}f`;
			type = 'vec';
			location = getlocation();
		}
		else if (value instanceof Color) {
			method = 'uniform4f';
			type = 'col';
			location = getlocation();
		}
		else if (value instanceof Image) {
			method = 'uniform1i';
			type = 'img';
			location = getlocation();

			value = this.addTexture(value);
		}
		else if (typeof value === 'number') {
			method = 'uniform1f';
			type = 'num';
			location = getlocation();
		}
		else if (value instanceof Array) {
			for (var i = 0; i < value.length; i++) {
				var nval = value[i];
				this.initializeUniform(`${key}[$i]`, nval, out);
			}
			return;
		}
		else if (typeof value === 'object') {
			for (var i in value) {
				if (value.hasOwnProperty(i)) {
					var nval = value[i];
					this.initializeUniform(`${key}.${i}`, nval, out);
				}
			}
			return;
		}

		out[key] = {
			isActive: false,
			method,
			location,
			type,
			value
		};
	}

	update() {
		var gl = this.webGL;
		var shader = this.shader,
			program = this.program,
			attributes = shader.attributes,
			uniforms = shader.uniforms,
			textures = shader.textures;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				this.updateAttribute(attributes[i]);
			}
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				this.updateUniform(uniforms[i]);
			}
		}

		for (var i in textures) {
			if (textures.hasOwnProperty(i)) {
				this.activeTexture(i, textures[i]);
			}
		}
	}

	updateAttributes({buffer, location, size} = {}) {
		var gl = this.webGL;
		var shader = this.shader,
			program = this.program;

		if (location >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(location);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}

	updateUniform({method, location, type, value} = {}) {
		if (uniform.isActive) {
			return;
		}
		else {
			uniform.isActive = true;
		}

		var gl = this.webGL;
		var shader = this.shader,
			program = this.program;

		switch (type) {
			case 'mat':
			gl[method](location, null, new Float32Array(...value.array));
			break;

			case 'col':
			value = value.normalize();
			case 'vec':
			gl[method](location, new Float32Array(...value.array));
			break;

			case 'img':
			case 'num':
			gl[method](location, value);
			break;
		}
	}