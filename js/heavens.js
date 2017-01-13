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
		var aggregation = this.physic.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	draw(renderer) {
		var all = [];
		var links = this.links;
		var color = this.physic.color;

		for (var link of links) {
			all.push(link.screenPosition(renderer));
		}

		var ctx = renderer.ctx;
		ctx.beginPath();

		var isFirstPoint = true;
		for (var vec of all) {
			var v0 = vec[2],
				v1 = vec[1];

			if (isFirstPoint) {
				isFirstPoint = false;
				ctx.moveTo(v0.x, v0.y);
			}
			ctx.lineTo(v1.x, v1.y);
		}

		ctx.closePath();
		
		ctx.fillStyle = color.rgb;
		ctx.fill();

		var inverse = color.halfinverse();
		var lastv;

		ctx.beginPath();

		for (var i = 0; i < all.length; i++) {
			var vec = all[i];

			var v0 = vec[2],
				v1 = vec[3],
				v2 = vec[0],
				v3 = vec[1];

			if (i == 0) {
				ctx.moveTo(v0.x, v0.y);
			}
			else {
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(lastv.x, lastv.y);
				ctx.lineTo(v1.x, v1.y);
				ctx.lineTo(v0.x, v0.y);
			}
			ctx.lineTo(v1.x, v1.y);
			ctx.lineTo(v2.x, v2.y);
			ctx.lineTo(v3.x, v3.y);
			ctx.lineTo(v0.x, v0.y);

			lastv = v0;

			if (i == all.length - 1) {
				var fvec = all[0];
				ctx.moveTo(fvec[2].x, fvec[2].y);
				ctx.lineTo(lastv.x, lastv.y);
				ctx.lineTo(fvec[3].x, fvec[3].y);
				ctx.lineTo(fvec[2].x, fvec[2].y);
			}
		}

		ctx.closePath();
		
		ctx.fillStyle = inverse.rgb;
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

	get links() {
		return this.links_;
	}
}

class Link extends Item {
	constructor(parent, radius, index) {
		super();

		var interval = 360 / LINKS_COUNT;
		var deg = index * interval;

		this.mesh_ = new Mesh;
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
		var width = height / 8;

		this.mesh.vertices = Vertices.array(
			[-width / 2, height / 2],
			[width / 2, height / 2],
			[width / 2, -height / 2],
			[-width / 2, -height / 2]
		);
	}
}
