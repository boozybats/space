/**
 * Main gameobject known as asteroid.
 * Doesn't pass a mesh because "Sphere" will generate itself.
 */
class Heaven extends Sphere {
	constructor({
		id,
		name = 'asteroid',
		body = new Body,
		collider = new Collider,
		physic = new Physic,
		rigidbody = new Rigidbody,
		player = false,
		mouseControl
	} = {}) {
		super({
			id: id,
			name: name,
			body: body,
			collider: collider,
			physic: physic,
			rigidbody: rigidbody,
			precision: 3
		});

		// Defines item as player's item
		this.player = player;

		// Binds object movements depends on mouse axis
		this.mouseControl = mouseControl;

		this.initializeMesh();
		this.initializeRigidbody();
		this.initialize();
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (!(val instanceof Body)) {
			val = new Body;
		}

		this.body_ = val;
	}

	get mesh() {
		return this.mesh_;
	}
	set mesh(val) {
		if (!(val instanceof Mesh)) {
			this.corrupted = true;
			val = undefined;
		}

		this.mesh_ = val;
	}

	get collider() {
		return this.collider_;
	}
	set collider(val) {
		if (!(val instanceof Collider)) {
			val = new Collider;
		}

		this.collider_ = val;
	}

	get physic() {
		return this.physic_;
	}
	set physic(val) {
		if (!(val instanceof Physic)) {
			val = new Physic;
		}

		this.physic_ = val;
	}

	get rigidbody() {
		return this.rigidbody_;
	}
	set rigidbody(val) {
		if (!(val instanceof Rigidbody)) {
			val = new Rigidbody;
		}

		this.rigidbody_ = val;
	}

	get mouseControl() {
		return this.mouseControl_;
	}
	set mouseControl(val) {
		if (val && !(val instanceof Cursor)) {
			console.warn(`Heaven: mouseControl: must be a Cursor, type: ${typeof val}, value: ${val}, item id: ${this.id}`);
			return;
		}

		this.mouseControl_ = val;
	}

	get player() {
		return this.player_;
	}
	set player(val) {
		if (val && !(val instanceof Player)) {
			console.warn(`Heaven: player: must be a boolean, type: ${typeof val}, value: ${val}, item id: ${this.id}`);
			return;
		}

		this.player_ = val;
	}

	/**
	 * Binds camera to object, so it's follows object
	 * @param  {Camera} camera
	 */
	bindCamera(camera) {
		if (!(camera instanceof Camera)) {
			console.warn(`Heaven: bindCamera: must be a Camera, type: ${typeof camera}, value: ${camera}, item id: ${this.id}`);
			return;
		}

		this.camera = camera;
	}

	initialize() {
		var _private = this.private;
		var self = this;
		this.onupdate = function() {
			var oldDiameter = _private.diameter,
				diameter = self.physic.diameter;
			if (oldDiameter !== diameter) {
				_private.diameter = diameter;
				self.body.scale = new Vec3(diameter, diameter, diameter);
			}

			if (self.mouseControl) {
				var mouse = self.mouseControl;

				var vec = mouse.position.xyz;
				var maxspeed = self.physic.maxspeed;

				var dir = amc('*', vec, maxspeed);

				var length = dir.length();
				if (length > maxspeed) {
					dir = amc('*', vec.normalize(), maxspeed);
				}

				self.rigidbody.velocity = dir;
			}

			if (self.camera) {
				var cam = self.camera.body;
				var body = self.body;

				var z = body.scale.z * -6;

				cam.position = new Vec3(body.position.xy, z);
			}
		}
	}

	initializeMesh() {
		// Add maps to shader
		var normalmap = new Image();
		normalmap.src = 'images/n_heaven.jpg';

		var diffusemap = new Image();
		diffusemap.src = 'images/d_heaven.jpg';

		// Set heaven's shader, not parent's
		this.mesh.shader = shaders.heaven;
		this.mesh.material = new Material({
			normalmap:  normalmap,
			diffusemap: diffusemap
		});
	}

	initializeRigidbody() {
		var self = this;
		this.rigidbody.onupdate = function({
			deltaTime
		} = {}) {
			if (!this.player) {
				return;
			}

			var body = self.body;

			var velocity = this.velocity;
			if (velocity.length() !== 0) {
				if (self.player) {
					self.player.addAction('velocity', velocity.array());
				}
			}
		}
	}

	toJSON() {
		var out = {};

		if (this.body) {
			out.body = this.body.toJSON();
		}

		return out;
	}

	uptodate(data) {
		if (typeof data !== 'object') {
			return;
		}

		if (typeof data.body === 'object') {
			var pos = data.body.position,
				rot = data.body.rotation,
				sca = data.body.scale;

			if (typeof pos !== 'object' ||
				typeof rot !== 'object' ||
				typeof sca !== 'object') {
				console.warn('Heaven: uptodate: "body" bad request from server');
				return;
			}

			if (!this.body) {
				this.body = new Body;
			}

			this.body.position = new Vec3(pos[0], pos[1], pos[2]);
			this.body.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
			// this.body.scale = new Vec3(sca[0], sca[1], sca[2]);
		}

		if (typeof data.physic === 'object') {
			var matter = data.physic.matter;

			if (typeof matter !== 'object') {
				console.warn('Heaven: uptodate: "physic" bad request from server');
				return;
			}

			if (this.physic) {
				this.physic.matter = new Matter(matter);
			}
			else {
				this.physic = new Physic({
					matter: new Matter(matter)
				});
			}
		}
	}
}
