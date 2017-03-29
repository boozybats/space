function gameplay(images) {
	canvas.appendTo(document.body);

	// initialize project, set as default image "Transparent"
	var project = new Project({
		transparentImage: images.transparent
	});
	project.attachCanvas(canvas);

	// initialize webGLRenderer and set attributes
	project.initializeWebGLRenderer({
		attributes: {
			antialias: 'FXAAx2'
		}
	});

	// set first layer for webGL drawning in project
	project.initialize();

	var scene = project.createScene('main', true);
	var camera = new Camera;
	scene.appendCamera(camera);

	// make camera as flashlight
	var light = new PointLight({
		body: new Body({
			parent: camera.body
		})
	});
	scene.addLight(light);

	// game logic item, needs to complete functions on each frame
	var logic = new Logic(scene);

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

	// scaling after instantiation because need to determine diameter
	me.body.scale = amc('+', new Vec3, me.physic.diameter);

	// make light source follows camera
	me.bindCamera(camera);

	// direction pointer, lightning
	var facebox = new FaceBox;
	facebox.instance(scene, true);

	// share variables enviroment
	facebox.private.env_heaven = me.public;

	// get "id" from server and start project
	server.getid(id => {
		me.id = id;
		project.requestAnimationFrame();
	});
}
