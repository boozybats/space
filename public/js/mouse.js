class MouseItem extends Item {
	constructor({
		storage
	}) {
		super();
		this.initializeMesh();

		this.body.scale = new Vec3(
			1 * (storage.w / RESOLUTION_WIDTH),
			1 * (storage.h / RESOLUTION_HEIGHT),
			1
		);
		this.storage = storage;
	}

	initializeMesh() {
		var vertices = [
			-1, -1, -1,
			-1, 1, -1,
			1, 1, -1,
			1, -1, -1
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
		texture.src = 'images/mouse.jpg';

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_UI: UI
			},
			uniforms: {
				u_Texture: texture
			},
			vertexIndices: VI,
			shader: MouseItem.shader
		});
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

				if (texel.g == 1.0) {
					texel = vec4(0.0);
				}
				gl_FragColor = texel;
			}`
		);

		return out;
	}

	get storage() {
		return this.storage_;
	}

	set storage(val) {
		if (typeof val === 'object') {
			this.storage_ = val;
		}
		else {
			console.warn('Mouse: storage: error');
		}
	}
}
