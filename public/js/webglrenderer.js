class WebGLRenderer {
	constructor(project) {
		var gl;
		var canvas = project.canvas.canvas;
		var methods = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

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

		if (gl) {
		}
		else {
			console.warn('WebGLRenderer: error');
		}
	}

	clearScene(skyBoxType, skyBoxColor) {
		var gl = this.webGL;

		switch(skyBoxType) {
			case 'fill':
			gl.clearColor(...skyBoxColor.array);
			break;

			case 'transparent':
			gl.clearColor(0, 0, 0, 0);
			break;
		}

		gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	drawScene({
		deltaTime = 0
	} = {}) {
		var project = this.project;
		var layers = project.layers;
		var scene = project.currentScene;
		var items = scene.items;
		var cameras = scene.cameras;

		var self = this;
		for (var i = layers.length - 1; i >= 0; i--) {
		//for (var i = 0; i < layers.length; i++) {
			self.clearScene(scene.skyBoxType, scene.skyBoxColor);
			var layer = layers[i];

			(arr => {
				//for every camera draw new field
				for (var camera of cameras) {
					//project matrix from camera
					self.mvpmatrix = Mat.multi(
						Mat4.translate(camera.body.position.inverse()),
						Mat4.translate(new Vec3(0, 0, -camera.deepOffset)),
						Mat4.rotate(camera.body.rotation.inverse()),
						Mat4.translate(new Vec3(0, 0, camera.deepOffset)),
						camera.projectionMatrix
					);

					for (var j = arr.length - 1; j >= 0; j--) {
						var item = arr[j];

						//check to access item at frame
						if (item.unavailableFrames && item.unavailableFrames.indexOf(i) == -1) {
							continue;
						}

						layer({item, camera});  //call every redraw function
					}
				}
			})(items);
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
		project.addLayer(({
			item,
			camera
		}) => {
			var scene = project.currentScene;

			if (item.mesh) {
				if (!(item.body instanceof Body)) {
					console.warn(`Item '${item.name}' doesnt have a body`);
				}
				
				var eyematrix = camera.mvmatrix;
				var mvmatrix = item.mvmatrix;
				var mvnmatrix = mvmatrix.normalize();
				var lights = scene.sceneLights;

				//update MVMatrix and MVPMatrix
				item.changeUniforms({
					u_MVMatrixEye: eyematrix,
					u_MVMatrix: mvmatrix,
					u_MVPMatrix: self.mvpmatrix,
					u_MVNMatrix: mvnmatrix,
					u_DirectionalLights: lights.directionalLights,
					u_PointLights: lights.pointLights
				});

				item.update();

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.VIOBuffer);
				gl.drawElements(gl[item.drawStyle], item.VIOBuffer.length, gl.UNSIGNED_SHORT, 0);
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
		return this.viewportHeight_;
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
