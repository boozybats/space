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

		this.initialize();
		this.initializeMesh();

		// Set events to rigidbody to send on server user's acions
		if (this.player) {
			this.initializeRigidbody();
		}

		// Latency of animation
		this.interpolationDelay = 100;
		// How much time needs to predict future after losing connection
		this.extrapolationDuration = 250;

		var tmpData = new Storage;
		tmpData.filter = (data => typeof data === 'object');
		this.temporaryData = tmpData;
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

	// Sets changes for item
	applyChanges(state) {
		if (state.body) {
			var pos = state.body.position,
				rot = state.body.rotation,
				sca = state.body.scale;

			this.body.position = new Vec3(pos[0], pos[1], pos[2]);
			// this.body.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
			// this.body.scale = new Vec3(sca[0], sca[1], sca[2]);
		}

		if (state.physic) {
			var matter = state.physic.matter;
			if (this.physic.matter.empty) {
				this.physic.matter = new Matter(matter);
			}
		}
	}

	// Are called by interpolation, sets interstitial changes for item between 2 states
	applyInterstitialChanges(state1, state2, time) { 
		var state = {};

		var deltaTime = state2.receiveTime - state1.receiveTime;
		var relTime = state2.receiveTime - time;
		var precision = relTime / deltaTime;

		if (state1.body && state2.body) {
			var pos = vec3avg(state1.body.position, state2.body.position),
				// rot = qua3avg(state1.body.rotation, state2.body.rotation),
				sca = vec3avg(state1.body.scale, state2.body.scale);

			state.body = {
				position: pos,
				rotation: state2.body.rotation,
				scale: sca
			};
		}

		if (state1.physic) {
			state.physic = state1.physic;
		}

		this.applyChanges(state);

		function vec3avg(arr1, arr2) {
			var result = [
				arr1[0] + (arr2[0] - arr1[0]) * precision,
				arr1[1] + (arr2[1] - arr1[1]) * precision,
				arr1[2] + (arr2[2] - arr1[2]) * precision
			];

			return result;
		}

		function qua3avg(arr1, arr2) {
			var qua1 = new Quaternion(arr1[0], arr1[1], arr1[2], arr1[3]),
				qua2 = new Quaternion(arr2[0], arr2[1], arr2[2], arr2[3]);

			var difference = amc('-', qua2, qua1);
			var bud = amc('*', difference, precision);
			var result = amc('+', qua1, bud);

			return result;
		}
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

	// Predicts further actions if server distribution isn't received
	extrapolate() {
	}

	get extrapolationDuration() {
		return this.extrapolationDuration_;
	}
	set extrapolationDuration(val) {
		if (typeof val !== 'number') {
			val = 0;
		}

		this.extrapolationDuration_ = val;
	}

	// Sets onupdate function for heaven
	initialize() {
		var _private = this.private;
		var self = this;
		this.onupdate = function({
			time
		}) {
			this.interpolate(time);

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

	// Sets maps to shader
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

	// Sets onupdate function for heaven's rigidbody
	initializeRigidbody() {
		if (!this.player) {
			return;
		}

		this.rigidbody.onсhange('velocity', (value, duration) => {
			this.player.addAction('velocity', {
				value: value,
				duration: duration
			});
		});
	}

	// Smooths actions between server distributions
	interpolate(time) {
		var isNext = false,
			startIndex;
		var interstitial = this.temporaryData.find((data, index) => {
			if (isNext) {
				isNext = false;
				return true;
			}
			else if (data.receiveTime + this.interpolationDelay >= time) {
				startIndex = index;
				isNext = true;
				return true;
			}

			return false;
		});

		if (interstitial.length < 2) {
			this.extrapolate(time);
			return;
		}

		this.temporaryData.splice(0, startIndex);

		this.applyInterstitialChanges(interstitial[0], interstitial[1], time);
	}

	get interpolationDelay() {
		return this.interpolationDelay_;
	}
	set interpolationDelay(val) {
		if (typeof val !== 'number') {
			val = 0;
		}

		this.interpolationDelay_ = val;
	}

	/* Receives data from server and stores into temporary storage to use
	by interpolation */
	receiveData(data, time) {
		if (typeof data !== 'object') {
			return;
		}

		var lastReceive = this.temporaryData.getLast();
		if (lastReceive && lastReceive.receiveTime >= time) {
			return;
		}

		if (typeof data.body === 'object') {
			var pos = data.body.position,
				rot = data.body.rotation,
				sca = data.body.scale;

			if (typeof pos !== 'object' ||
				typeof rot !== 'object' ||
				typeof sca !== 'object') {
				return;
			}
		}

		if (this.player) {
			this.applyChanges(data);
		}
		else {
			data.receiveTime = time;
			this.temporaryData.push(data);
		}
	}

	toJSON() {
		var out = {};

		if (this.body) {
			out.body = this.body.toJSON();
		}

		return out;
	}
}
