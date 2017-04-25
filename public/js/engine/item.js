/**
 * Item stores info about object: {@link Body}, {@link Mesh},
 * {@link Physic}, {@link Collider}, etc. Created item doesn't
 * instantly binds to scene, it must be instantiated by same method.
 * @this {Item}
 * @param {Object} options
 * @param {Boolean} options.enabled Does item exist on scene.
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Mesh} options.mesh
 * @param {Physic} options.physic
 * @param {Collider} options.collider
 * @class
 * @property {Boolean} enabled Does item exist on scene.
 * @property {Number} id
 * @property {String} name
 * @property {Body} body
 * @property {Mesh} mesh
 * @property {Physic} physic
 * @property {Collider} collider
 * @property {Object} public A variable environment that can be
 * obtained by external methods.
 * @property {Object} private A variable environment that can be
 * obtained only in this object.
 * @property {Scene} scene On wich scene was instantiated.
 * @property {Project} project Binded project.
 * @property {WebGLRenderingContext} webGL WebGL item of {@link Project}'s
 * {@link WebGLRenderer}.
 */

class Item {
	constructor({
		enabled = true,
		id,
		name,
		body,
		mesh,
		collider,
		physic,
		rigidbody
	} = {}) {
		this.enabled = enabled;
		this.id = id;
		this.name = name;
		this.body = body;
		this.mesh = mesh;
		this.collider = collider;
		this.physic = physic;
		this.rigidbody = rigidbody;

		// Has been item instantiated
		this.isInstanced = false;
		// If item corrupted it will not be instantiated
		this.isCorrupted = false;
		// A variable environment that can be obtained by external methods
		this.public_ = {};
		// A variable environment that can be obtained only in this object
		this.private_ = {};

		this.oninstance = function() {};
		this.onupdate   = function() {};
		this.onremove   = function() {};
	}

	get enabled() {
		return this.enabled_;
	}
	set enabled(val) {
		if (typeof val !== 'boolean') {
			throw new Error('Item: enabled: must be a bool');
		}

		this.enabled_ = val;
	}

	get id() {
		return this.id_;
	}
	set id(val) {
		if (typeof val !== 'number') {
			val = -2;
		}

		this.id_ = val;
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			val = 'anonymous';
		}

		this.name_ = val;
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (val && !(val instanceof Body)) {
			val = undefined;
		}

		this.body_ = val;
	}

	get mesh() {
		return this.mesh_;
	}
	set mesh(val) {
		if (val && !(val instanceof Mesh)) {
			val = undefined;
		}

		this.mesh_ = val;
	}

	get collider() {
		return this.collider_;
	}
	set collider(val) {
		if (val && !(val instanceof Collider)) {
			val = undefined;
		}

		this.collider_ = val;
	}

	get physic() {
		return this.physic_;
	}
	set physic(val) {
		if (val && !(val instanceof Physic)) {
			val = undefined;
		}

		this.physic_ = val;
	}

	/**
	 * Instances item to scene. Intializes shader, attributes, uniforms
	 * and write it to the shader, defines vertexIndices. Adds to
	 * item's properties "scene", "project" and "webGL".
	 * @param {Scene} scene
	 * @param {Boolean} system Defines object type: system or regular
	 * @method
	 * @example
	 * var item = new Item(options);
	 *
	 * var scene = new Scene('main');
	 *
	 * item.instance(scene, true);
	 */
	instance(scene, isSystem = false) {
		if (this.isCorrupted) {
			console.once(this.id, () => console.log(`Item: instance: item corrupted and wont be instantiated, id: ${this.id}, name: ${this.name}`));
		}

		if (!(scene instanceof Scene)) {
			throw new Error('Item: instance: must be a Scene');
		}

		if (isSystem) {
			scene.appendSystemItem(this);
		}
		else {
			scene.appendItem(this);
		}

		this.isInstanced = true;
		this.scene_ = scene;
		this.project_ = scene.project;
		this.webGL_ = this.project.webGLRenderer.webGL;

		this.oninstance();
	}

	/**
	 * Called after item instantiation
	 * @method
	 * @callback
	 */
	get oninstance() {
		return this.oninstance_;
	}
	set oninstance(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.oninstance_ = val;
	}

	/**
	 * Called after {@link Project} initialization on each frame
	 * @method
	 * @callback
	 */
	get onupdate() {
		return this.onupdate_;
	}
	set onupdate(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onupdate_ = val;
	}

	/**
	 * Called after item remove
	 * @method
	 * @callback
	 */
	get onremove() {
		return this.onremove_;
	}
	set onremove(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onremove_ = val;
	}

	get private() {
		return this.private_;
	}

	get project() {
		return this.project_;
	}

	get public() {
		return this.public_;
	}

	/**
	 * Removes item from {@link Scene}'s objects. After
	 * remove item can not be instantiated again, it needs
	 * to create new item.
	 * @method
	 */
	remove() {
		if (this.onremove) {
			this.onremove();
		}

		if (this.scene) {
			this.scene.removeItem(this);
		}
	}

	get rigidbody() {
		return this.rigidbody_;
	}
	set rigidbody(val) {
		if (val && !(val instanceof Rigidbody)) {
			val = undefined;
		}

		this.rigidbody_ = val;
	}

	get scene() {
		return this.scene_;
	}

	toJSON() {
		var out = {};

		out.id = this.id;

		if (this.body) {
			out.body = this.body.toJSON();
		}

		if (this.physic) {
			out.physic = this.physic.toJSON();
		}

		return out;
	}

	get webGL() {
		return this.webGL_;
	}
}
