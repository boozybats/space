class Heaven extends Item {
	constructor({
		name = 'asteroid',
		body = new Body,
		physic = new Physic({
			matter: {
				Fe: 50 * Math.pow(10, 5)
			}
		}),
		shader
	} = {}) {
		super({
			name: name,
			body: body,
			physic: physic
		});

		this.vertexCount_ = 360;

		this.initialize_mesh(shader);
	}

	get core() {
		var aggregation = this.physic.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	initialize_mesh(shader) {
		var startVI = [0, 0, 0];
		var a_Position = [...startVI];
		a_Position.size = 3;
		var VI = [];
		var radius = this.physic.diameter / 2;

		for (var i = 0; i < this.vertexCount_; i++) {
			var index = i + 1;
			if (i == 0) {
				VI.push(index, 0);
			}
			else {
				VI.push(index, index, 0);
			}
			a_Position.push(...this.vertex(i, radius));
		}
		VI.push(1);

		var normalmap = Item.image('images/heaven_normalmap.jpg');
		var a_Normal = Item.normals(a_Position, VI);
		var a_UI = Item.UIs(a_Position, VI);

		this.mesh = new Mesh({
			attributes: {
				a_Position,
				a_Normal,
				a_UI
			},
			textures: {
				u_NormalMap: normalmap
			},
			uniforms: {
				u_Radius: radius,
				u_Color: this.physic.color.normal.Vec
			},
			vertexIndices: VI,
			shader: shader
		});
	}

	vertex(index, radius = this.physic.diameter / 2) {
		var out;

		var radius = radius;
		var interval = 360 / this.vertexCount_;
		var deg = index * interval;

		var rad = Math.DTR(deg);
		var x = Math.cos(rad) * radius,
			y = Math.sin(rad) * radius;

		out = [x, y, 0];

		return out;
	}
}
