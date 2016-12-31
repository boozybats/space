const LINKS_COUNT = 360 / 10;

class Heaven {
	constructor(options = {
		physic: {
			matter: {
				Fe: 50 * Math.pow(10, 6);
			}
		}
	}) {
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
		this.init_mesh();
	}

	init_physic(options) {
		this.physic_ = new Physic(options);
	}

	init_mesh() {
		this.mesh_ = new Mesh(this.physic_.diameter);
		this.initialize_links();
	}

	initialize_links() {
		for (var i = 0; i < LINKS_COUNT; i++) {
			var link = new Link(i);
		}
	}
}

class Link extends Mesh {
	constructor() {
		super();
		this.initialize();
	}

	get body() {
		var body = {
			position: position,
			rotation: rotation,
			scale: scale
		};

		return body;
	}

	initialize() {
		this.fillStyle_ = '#000000';
		this.body_ = new Body;

		initialize_vertices();
	}

	initialize_vertices() {
		var width = 0.1;
		var height = 1;

		this.vertices_ = Vertices.array(
			[-width / 2, height / 2],
			[width / 2, height / 2],
			[-width / 2, -height / 2],
			[width / 2, -height / 2]
		);
	}
}
