function gameplay(images) {
	canvas.appendTo(document.body);

	var project = new Project({
		transparentImage: images.transparent
	});
	project.attachCanvas(canvas);
	project.initializeWebGLRenderer({
		attributes: {
			antialias: 'FXAAx2'
		}
	});
	project.initialize();

	var scene = project.createScene('main', true);
	var camera = new Camera;
	scene.appendCamera(camera);

	var light = new PointLight({
		body: new Body({
			parent: camera.body
		})
	});
	scene.addLight(light);

	/**
	 * Determine player's object, bind cursor, scale
	 * to the required diameter to skip perframe scaling
	 * at the begin
	 */
	cursor = new Cursor;
	var me = new Heaven({
		name: 'me',
		me: true,
		mouseControl: cursor
	});
	me.instance(scene, true);
	me.rotate(new Vec3(0, 0.5));
	me.body.scale = amc('+', new Vec3, me.physic.diameter);
	// make light source follows camera
	me.bindCamera(camera);

	var facebox = new FaceBox;
	facebox.instance(scene, true);
	facebox.private.env_heaven = me.public;

	server.getid(id => {
		me.id = id;
		project.requestAnimationFrame();
	});
}
