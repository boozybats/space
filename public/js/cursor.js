class Cursor extends Item {
	constructor({} = {}) {
		super();
		this.width = 30;
		this.height = 30;
		this.forceback = false;
		this.keepchase = false;

		this.position = new Vec3(
			RESOLUTION_WIDTH / 2,
			RESOLUTION_HEIGHT / 2,
			0
		);
		this.body.scale = new Vec3(
			1 * (this.width / RESOLUTION_WIDTH),
			1 * (this.height / RESOLUTION_HEIGHT),
			1
		);

		this.initializeMesh();
	}

	get forceback() {
		return this.forceback_;
	}

	set forceback(val) {
		if (typeof val === 'boolean') {
			this.forceback_ = val;
		}
		else {
			console.warn('Cursor: forceback: error');
		}
	}

	get height() {
		return this.height_;
	}

	set height(val) {
		if (typeof val === 'number') {
			this.height_ = val;
		}
		else {
			console.warn('Mouse: height: error');
		}
	}

	initializeMesh() {
		var vertices = [
			0, -2, 0,
			0, 0, 0,
			2, 0, 0,
			2, -2, 0
		];
		vertices.size = 3;

		var UI = [
			0, 0,
			0, 1,
			1, 1,
			1, 0
		];
		UI.size = 2;

		var VI = [0, 1, 2, 2, 3, 0];

		var texture = new Image();
		texture.src = 'images/cursor.jpg';

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_UI: UI
			},
			uniforms: {
				u_Texture: texture
			},
			vertexIndices: VI,
			shader: Cursor.shader
		});
	}

	get keepchase() {
		return this.keepchase_;
	}

	set keepchase(val) {
		if (typeof val === 'boolean') {
			this.keepchase_ = val;
		}
		else {
			console.warn('Cursor: keepchase: error');
		}
	}

	get position() {
		return this.position_;
	}

	set position(val) {
		if (val instanceof Vec) {
			var x = (val.x) / RESOLUTION_WIDTH * 2 - 1;
			var y = -(val.y) / RESOLUTION_HEIGHT * 2 + 1;

			this.body.position = new Vec3(x, y, 0);
			this.position_ = val;
		}
		else {
			console.warn('Cursor: position: error');
		}
	}

	static get shader() {
		var out = new Shader(
			`precision highp float;

			attribute vec3 a_Position;
			attribute vec2 a_UI;

			uniform mat4 u_MVMatrix;

			varying vec2 v_UI;

			void main(void) {
				v_UI = a_UI;

				gl_Position = u_MVMatrix * vec4(a_Position, 1.0);
			}`,

			`precision highp float;

			uniform sampler2D u_Texture;

			varying vec2 v_UI;

			void main(void) {
				vec4 texel = texture2D(u_Texture, v_UI);

				if (texel.r == 0.0 && texel.b == 0.0 && texel.g == 1.0) {
					texel = vec4(0.0);
				}
				gl_FragColor = texel;
			}`
		);

		return out;
	}

	get width() {
		return this.width_;
	}

	set width(val) {
		if (typeof val === 'number') {
			this.width_ = val;
		}
		else {
			console.warn('Mouse: width: error');
		}
	}
}
