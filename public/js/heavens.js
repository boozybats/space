const LINKS_COUNT = 360 / 12;

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

		this.initialize_links(shader);
	}

	appendToScene(scene) {
		if (!(scene instanceof Scene)) {
			console.warn('Heaven: appendToScene: error');
		}

		for (var link of this.links) {
			scene.appendItem(link);
		}
	}

	get core() {
		var aggregation = this.physic.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	initialize_links(shader) {
		var textures = [
			Item.image('images/img0.jpg'),
			Item.image('images/img1.jpg')
		];

		this.links = [];
		for (var i = 0; i < LINKS_COUNT; i++) {
			var link = new Link({
				parent: this.body,
				radius: this.physic.diameter,
				shader: shader,
				index: i,
				texture: (i % 2 == 0) ? textures[0] : textures[1]
			});
			this.links.push(link);
		}
	}

	get links() {
		return this.links_;
	}

	set links(val) {
		if (val instanceof Array) {
			this.links_ = val;
		}
		else {
			console.warn('Heaven: links: error');
		}
	}
}

class Link extends Item {
	constructor({
			parent,
			radius,
			shader,
			index,
			texture
		}) {
		var interval = 360 / LINKS_COUNT;
		var deg = index * interval;

		var rad = Math.DTR(deg);
		var x = Math.cos(rad) * radius,
			y = Math.sin(rad) * radius;

		super({
			name: 'link',
			body: new Body({
				parent: parent,
				position: new Vec3(x, y, 0),
				rotation: Quaternion.Euler(0, 0, -deg)
			}),
			mesh: new Mesh({
				shader: shader,
				vertexIndices: [
					0, 1, 2,
					2, 3, 0
				],
				textures: {
					u_Sampler: texture
				}
			})
		});

		this.initialize_vertices(radius);
	}

	initialize_vertices(radius) {
		var height = 2 * Math.PI * radius / LINKS_COUNT;
		var width = height / 8;

		var a_Position = [
			-width / 2, height / 2, 0,
			width / 2, height / 2, 0,
			width / 2, -height / 2, 0,
			-width / 2, -height / 2, 0
		];
		a_Position.size = 3;
		this.mesh.attributes['a_Position'] = a_Position;
	}
}
