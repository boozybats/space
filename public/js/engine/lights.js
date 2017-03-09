/**
 * Pseudo-object on scene wich intence the light,
 * object contains info about light like position,
 * intensity, ambient color, e.t.c; easy to send in shader
 *
 * @constructor
 * @this {Light}
 * @param {string} name
 * @param {Body} body
 */

class Light extends Item {
	constructor({
		name = 'light',
		body = new Body
	} = {}) {
		super({name, body});
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (!(val instanceof Body)) {
			throw new Error('Light: body: must be a Body');
		}

		this.body_ = val;
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			throw new Error('Light: name: must be a string');
		}

		this.name_ = val;
	}

	data() {
		var out = {};

		switch (this.constructor) {
			case DirectionalLight:
			out.type = 1;
			break;

			case PointLight:
			out.type = 2;
		}

		var position = amc('*', new Vec4(0, 0, 0, 1), this.mvmatrix()).tocartesian();
		out.position = position;
		out.rotation = this.body.rotation.euler;
		out.intensity = this.intensity || 0;

		return out;
	}
}

/**
 * Direction light is the source of light which don't care
 * about position important only a rotation
 *
 * @constructor
 * @this {DirectionalLight}
 * @param {string} name
 * @param {Body} body
 */

class DirectionalLight extends Light {
	constructor({
		name = 'directionallight',
		body = new Body
	} = {}) {
		super({
			name,
			body
		});
	}
}

/**
 * Point light is the source of light which don't care
 * about rotation important only a position and intensity
 *
 * @constructor
 * @this {PointLight}
 * @param {string} name
 * @param {Body} body
 * @param {number} intensity
 */

class PointLight extends Light {
	constructor({
		name = 'pointlight',
		body = new Body,
		intensity = 100
	} = {}) {
		super({
			name,
			body
		});
	}
}
