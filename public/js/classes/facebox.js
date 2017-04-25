/**
 * Top layer for user vision, draws a direction arrow by
 * shader.
 */

class FaceBox extends UI {
	constructor({
		name = 'facebox',
		cursor
	} = {}) {
		super({
			name,
			width: RESOLUTION_MIN,
			height: RESOLUTION_MIN
		});

		this.mesh.shader = shaders.facebox;

		this.cursor = cursor;
		this.mesh.changeUniforms({
			u_Mouse: new Vec2,
			u_Resolution: new Vec2(RESOLUTION_MIN, RESOLUTION_MIN)
		});

		this.body.position = new Vec3;

		this.initialize();
	}

	get cursor() {
		return this.cursor_;
	}
	set cursor(val) {
		if (!(val instanceof Cursor)) {
			throw new Error('Facebox: cursor: must be a cursor');
		}

		this.cursor_ = val;
	}

	/**
	 * Sends uniforms velocity and maxspeed to shader
	 * to draw arrow. Velocity is normal vector that draws
	 * on circle radius.
	 */
	initialize() {
		this.onupdate = function() {
			this.mesh.changeUniforms({
				u_Mouse: this.cursor.position
			});
		}
	}
}
