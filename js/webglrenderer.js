class WebGLRenderer {
	constructor(project) {
		var gl;
		var canvas = project.canvas.canvas;
		var methods = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];

		for (var method of methods) {
			try {
				gl = canvas.getContext(method, {
					preserveDrawingBuffer: true
				});
			}
			catch(e) {}

			if (gl) {
				this.project = project;
				this.viewportWidth = canvas.width,
				this.viewportHeight = canvas.height;

				this.webGL = gl;

				break;
			}	 
		} 

		if (!gl) {
			console.warn('WebGLRenderer: error');
		}
	}

	clearScene(skyBoxType, skyBox) {
		var gl = this.WebGL;

		switch(skyBoxType) {
			case 'fill':
			gl.clearColor(skyBox[0], skyBox[1], skyBox[2], skyBox[3]);
			break;

			case: 'transparent':
			gl.clearColor(0, 0, 0, 0);
			break;
		}

		gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	get currentScene() {
		return this.currentScene_;
	}

	set currentScene(val) {
		if (val instanceof Scene) {
			this.currentScene_ = val;
		}
		else {
			console.warn('WebGLRenderer: currentScene: error');
		}
	}

	drawScene() {
		var project = this.project;
		var redraws = project.redraws;
		var scene = this.currentScene;
		var items = scene.items;
		var cameras = scene.cameras;

		var self = this;
		for (var r = redraws.length - 1; r >= 0; r--) {
		//for (var r = 0; r < redraws.length; r++) {
			(arr => {
				for (var camera of cameras) {  //for every camera draw new field
					self.clearScene(camera.skyBoxType, camera.skyBox);

					//project matrix from camera
					self.mvpmatrix = Mat.multi(
						Mat4.translate(camera.body.position.inverse()),
						Mat4.translate(new Vec3(0, 0, -camera.body.deepOffset)),
						Mat4.rotate(camera.body.rotation.inverse()),
						Mat4.translate(new Vec3(0, 0, camera.body.deepOffset)),
						camera.projectiveMatrix
					);

					for (var item of arr) {
						//check to access item at frame
						if (item.availableFrames && item.availableFrames.indexOf(r) == -1) {
							continue;
						}

						redraws[r][0](item, camera);  //call every redraw function
					}
				}
			})(items);

			if (redraws[r][1]) {
				redraws[r][1]();
			}
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
			console.warn('WebGLRenderer: project: error');
		}
	}

	setup() {
		//setup in project basic redraw function

		var project = this.project;
		var gl = this.webGL;

		var self = this;
		project.addRedrawFunction(0, function(item, camera) {
			var scene = self.currentScene;
			var shader = item.shader;

			if (shader) {
				var eyeposition = camera.body.position;

				if (!(item.Body instanceof Body)) {
					console.warn(`Item '${item.name}' doesnt have a body`);
				}

				var mvmatrix = item.mvmatrix.normalize();

				item.updateAttributes();
				item.updateTextures();

				//update MVMatrix and MVPMatrix
				item.updateShaderUniforms({
					u_EyePosition: eyeposition,
					u_MVMatrix: mvmatrix,
					u_MVPMatrix: renderer.mvpmatrix,
					u_MVNMatrix: mvnmatrix
				});

				var lightsUniforms = scene.getSceneLights();
				item.updateShaderUniforms(lightsUniforms);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.VIOBuffer);
				gl.drawElements(gl[item.drawStyle], item.VIOBuffer.number, gl.UNSIGNED_SHORT, 0);
			}
		});
	}

	get viewportWidth() {
		return this.viewportWidth_;
	}

	set viewportWidth(val) {
		if (typeof val === 'number') {
			this.viewportWidth_ = val;
		}
		else {
			console.warn('Project: viewportWidth: error');
		}
	}

	get viewportHeight() {
		return viewportHeight_;
	}

	set viewportHeight(val) {
		if (typeof val === 'number') {
			this.viewportHeight_ = val;
		}
		else {
			console.warn('Project: viewportHeight: error');
		}
	}

	get webGL() {
		return this.webGL_;
	}

	set webGL(val) {
		this.webGL_ = val;
	}
}
