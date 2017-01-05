const LINKS_COUNT = 360 / 12;

class Heaven extends Item {
	constructor({
		body,
		mesh,
		renderer = undefined,
		physic = {
			matter: {
				Fe: 50 * Math.pow(10, 5)
			}
		}
	}) {
		super({
			body: body,
			mesh: mesh
		});

		this.init_physic(physic);
		this.init_mesh(renderer);
	}

	get core() {
		var aggregation = this.physic_.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	draw(renderer) {
		var all = [];
		var links = this.links_;

		for (var link of links) {
			all.push(link.draw(renderer));
		}

		var isFirstPoint = true;
		var ctx = renderer.ctx;
		ctx.beginPath();
		for (var vec of all) {
			var v0 = vec[2],
				v1 = vec[3];
			if (isFirstPoint) {
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(v1.x, v1.y);
				isFirstPoint = false;
			}
			else {
				ctx.lineTo(v1.x, v1.y);
			}
		}
		ctx.closePath();
		ctx.fillStyle = 'red';
		ctx.fill();
	}

	initialize_links(renderer) {
		this.links_ = [];
		for (var i = 0; i < LINKS_COUNT; i++) {
			var link = new Link(this.body, this.physic.diameter, i);
			this.links_.push(link);
		}
	}

	init_mesh(renderer) {
		this.initialize_links(renderer);
	}

	init_physic(options) {
		this.physic_ = new Physic(options);
	}
}

class Link extends Item {
	constructor(parent, radius, index) {
		super();

		var interval = 360 / LINKS_COUNT;
		var deg = index * interval;

		this.mesh_ = new Mesh;
		this.mesh.fillStyle = '#ffffff';
		this.body.parent = parent;
		this.body.rotation = Quaternion.Euler(0, 0, deg);

		var rad = Math.DTR(deg);
		var x = Math.cos(rad) * radius,
			y = Math.sin(rad) * radius;
		this.body.position = new Vec3(x, y, 0);

		this.initialize_vertices(radius);
	}

	initialize_vertices(radius) {
		var height = 2 * Math.PI * radius / LINKS_COUNT;
		var width = height / 10;

		this.mesh.vertices = Vertices.array(
			[-width / 2, height / 2],
			[width / 2, height / 2],
			[width / 2, -height / 2],
			[-width / 2, -height / 2]
		);
	}
}
