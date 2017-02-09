class Cursor extends UI {
	constructor({} = {}) {
		var texture = new Image();
		texture.src = 'images/cursor.png';
		super({
			width: 30,
			height: 30,
			texture: texture
		});

		this.forceback = false;
		this.keepchase = false;
		this.position = new Vec3(
			RESOLUTION_WIDTH / 2,
			RESOLUTION_HEIGHT / 2,
			0
		);

		this.initiMesh();
	}

	get forceback() {
		return this.forceback_;
	}

	set forceback(val) {
		if (typeof val === 'boolean') {
			this.forceback_ = val;
		}
		else {
			console.warn('Cursor: forceback: error');
		}
	}

	initiMesh() {
		var vertices = [
			0, -2, 0,
			0, 0, 0,
			2, 0, 0,
			2, -2, 0
		];
		vertices.size = 3;

		this.mesh.attributes['a_Position'] = vertices;
	}

	get keepchase() {
		return this.keepchase_;
	}

	set keepchase(val) {
		if (typeof val === 'boolean') {
			this.keepchase_ = val;
		}
		else {
			console.warn('Cursor: keepchase: error');
		}
	}
}
