const LINKS_COUNT = 360 / 10;

class Heaven extends Item {
	constructor(options = {
		renderer: undefined,
		physic: {
			matter: {
				Fe: 50 * Math.pow(10, 6)
			}
		}
	}) {
		super(options);
		this.initialize(options);
	}

	get core() {
		var aggregation = this.physic_.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	initialize(options) {
		this.init_physic(options.physic);
		this.init_mesh(options.renderer);
	}

	init_physic(options) {
		this.physic_ = new Physic(options);
	}

	init_mesh(renderer) {
		this.initialize_links(renderer);
	}

	initialize_links(renderer) {
		var links = [];
		for (var i = 0; i < LINKS_COUNT; i++) {
			var link = new Link(this.body);
			links.push(link);
		}
		renderer.add(...links);
	}
}

class Link extends Item {
	constructor(parent) {
		super();
		this.initialize(parent);
	}

	initialize(parent) {
		this.mesh_ = new Mesh;
		this.mesh.fillStyle = '#ffffff';
		this.body.parent = parent;

		this.initialize_vertices();
	}

	initialize_vertices() {
		var width = 0.1;
		var height = 1;

		this.mesh.vertices = Vertices.array(
			[-width / 2, height / 2],
			[width / 2, height / 2],
			[width / 2, -height / 2],
			[-width / 2, -height / 2]
		);
	}
}
