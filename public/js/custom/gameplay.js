function gameplay(images) {
	canvas.appendTo(document.body);

	var project = new Project({
		transparentImage: images.transparent
	});
	project.initialize();
	project.attachCanvas(canvas);

	var scene = project.createScene('main', true);
	var camera = new Camera({
		body: new Body({
			position: new Vec3(0, 0, 0),
			rotation: Quaternion.Euler(0, 0, 0)
		})
	});
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
		body: new Body({
			position: new Vec3(0, 0, 5)
		}),
		name: 'me',
		me: true,
		mouseControl: cursor
	});
	me.instance(scene, true);
	me.rotate(new Vec3(0, 0.2));
	// make light source follows camera
	me.bindCamera(camera);
	me.body.scale = amc('+', new Vec3, me.physic.diameter);

	var facebox = new FaceBox;
	facebox.instance(scene, true);
	facebox.private.env_heaven = me.public;

	server.getid(id => {
		me.id = id;
		project.requestAnimationFrame();
	});
}
