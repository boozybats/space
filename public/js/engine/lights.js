/**
 * Contains light-object data on scene. More convenient than
 * use custom item for light because sends in shader
 * only the neccessary data. There are several types of light:
 * {@link DirectionalLight}, {@link PointLight}
 * @this {Light}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body}   options.body
 * @class
 * @property {String} name
 * @property {Body} body
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

	get ambient() {
		return this.ambient_;
	}
	set ambient(val) {
		if (!(val instanceof Color)) {
			throw new Error('Light: ambient: must be a Color');
		}

		this.ambient_ = val;
	}

	/**
	 * Makes an object from useful data.
	 * @return {Object}
	 */
	data() {
		var out = {};

		switch (this.constructor) {
			case DirectionalLight:
			out.type = 1;
			break;

			case PointLight:
			out.type = 2;
			break;
		}

		var position = amc('*', this.mvmatrix(), Vec.homogeneouspos).tocartesian();
		out.position = position;
		out.intensity = this.intensity || 0.0;
		out.ambient = this.ambient;
		out.diffuse = this.diffuse;
		out.specular = this.specular;

		return out;
	}

	get diffuse() {
		return this.diffuse_;
	}
	set diffuse(val) {
		if (!(val instanceof Color)) {
			throw new Error('Light: diffuse: must be a Color');
		}

		this.diffuse_ = val;
	}

	get intensity() {
		return this.intensity_ || 0;
	}
	set intensity(val) {
		if (typeof val !== 'number') {
			throw new Error('Light: intensity: must be a number');
		}

		this.intensity_ = val;
	}

	get specular() {
		return this.specular_;
	}
	set specular(val) {
		if (!(val instanceof Color)) {
			throw new Error('Light: specular: must be a Color');
		}

		this.specular_ = val;
	}
}

/**
 * Type of light that can be placed anywhere but rotation
 * must be choosen. Intensity has infinite value and
 * item has ininite scale with orthogonal light directivity.
 * @this {DirectionalLight}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Color} options.ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @param {Color} options.diffuse Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @param {Color} options.specular Shininess, reflected light
 * @class
 * @extends Light
 * @property {String} name
 * @property {Body} body
 * @property {Color} ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @property {Color} diffuse Brightness. Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @property {Color} specular Shininess, reflected light
 */

class DirectionalLight extends Light {
	constructor({
		name = 'directionallight',
		body = new Body,
		ambient = new Color(0, 0, 0, 1),
		diffuse = new Color(1, 1, 1, 1),
		specular = new Color(1, 1, 1, 1)
	} = {}) {
		super({
			name,
			body
		});
	}
}

/**
 * Type of light that lights around itself, position
 * must be choosen, rotation doesn't important. Point
 * light have limited intensity, so to see light on the
 * item must be placed near of it.
 * @this {PointLight}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Color} options.ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @param {Color} options.diffuse Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @param {Color} options.specular Shininess, reflected light
 * @param {Number} options.intensity
 * @class
 * @extends Light
 * @property {String} name
 * @property {Body} body
 * @property {Color} ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @property {Color} diffuse Brightness. Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @property {Color} specular Shininess, reflected light
 * @property {Number} intensity
 */

class PointLight extends Light {
	constructor({
		name = 'pointlight',
		body = new Body,
		ambient = new Color(0, 0, 0, 1),
		diffuse = new Color(1, 1, 1, 1),
		specular = new Color(1, 1, 1, 1),
		intensity = 10000
	} = {}) {
		super({
			name,
			body
		});

		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
		this.intensity = intensity;
	}
}
