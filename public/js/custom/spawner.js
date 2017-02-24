class Spawner {
	constructor({
		width = 5,
		height = 5,
		frequency = 1,
		count = 1,
		lifetime = 60
	} = {}) {
		this.count = count;
		this.frequency = frequency;
		this.lifetime = lifetime;
		this.height = height;
		this.width = width;
	}

	get count() {
		return this.count_;
	}

	set count(val) {
		if (typeof val === 'number') {
			this.count_ = val;
		}
		else {
			console.warn('Spawner: count: error');
		}
	}

	get frequency() {
		return this.frequency_;
	}

	set frequency(val) {
		if (typeof val === 'number') {
			this.frequency_ = val;
		}
		else {
			console.warn('Spawner: frequency: error');
		}
	}

	genspace() {
		var side = Math.floor(Math.random() * 4);
		var pos = {}, dir = {};
		
		switch(side) {
			case 0:
			pos.x = Math.random() * this.width;
			pos.y = -this.height;

			dir.x = Math.random();
			dir.y = 1;
			break;

			case 2:
			pos.x = Math.random() * this.width;
			pos.y = pos.y || this.height;

			dir.x = Math.random();
			dir.y = -1;
			break;

			case 1:
			pos.x = this.width;
			pos.y = Math.random() * this.height;

			dir.x = -1;
			dir.y = Math.random();
			break;

			case 3:
			pos.x = pos.x || -this.width;
			pos.y = Math.random() * this.height;

			dir.x = 1;
			dir.y = Math.random();
			break;
		}

		var position = new Vec3(pos.x, pos.y, 0);
		var direction = new Vec3(dir.x, dir.y, 0).normalize();

		var out = {
			position,
			direction
		};

		return out;
	}

	get height() {
		return this.height_;
	}

	set height(val) {
		if (typeof val === 'number') {
			this.height_ = val;
		}
		else {
			console.warn('Spawner: height: error');
		}
	}

	get lifetime() {
		return this.lifetime_;
	}

	set lifetime(val) {
		if (typeof val === 'number') {
			this.lifetime_ = val;
		}
		else {
			console.warn('Spawner: lifetime: error');
		}
	}

	start(scene) {
		var self = this;
		;(function update() {
			var startTime = new Date().getTime() / 1000;
			for (var i = 0; i < self.count; i++) {
				var space = self.genspace();

				let asteroid = new Heaven({
					body: new Body({
						position: space.position
					})
				});
				asteroid.physic.velocity = space.direction.multi(asteroid.physic.maxspeed);

				asteroid.instance(scene);
				asteroid.onupdate = function({
					currentTime
				}) {
					if (currentTime - startTime >= self.lifetime) {
						asteroid.destroy();
					}
				}
			}
			setTimeout(update, self.frequency * 1000);
		})();
	}

	get width() {
		return this.width_;
	}

	set width(val) {
		if (typeof val === 'number') {
			this.width_ = val;
		}
		else {
			console.warn('Spawner: width: error');
		}
	}
}
