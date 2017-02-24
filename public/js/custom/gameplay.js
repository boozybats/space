function gameplay(images) {
	canvas.appendTo(document.body);
	window.onresize();

	var project = new Project({
		transparentImage: images.transparent
	});
	project.attachCanvas(canvas);

	project.initializeWebGLRenderer();
	var webGLRenderer = project.webGLRenderer;
	var gl = webGLRenderer.webGL;

	var sceneName = 'main';
	var scene = project.createScene(sceneName);
	project.selectScene(sceneName);

	project.start();

	var camera = new Camera;
	scene.appendCamera(camera);

	var light = new PointLight({
		body: new Body({
			parent: camera.body
		})
	});
	scene.addLight(light);
	
	cursor = new Cursor;

	var facebox = new FaceBox;
	facebox.instance(scene);

	var me = new Heaven({
		physic: new Physic({
			matter: {
				Fe: 50 * Math.pow(10, 6)
			}
		})
	});
	me.bindCamera(camera);
	me.rotate(new Vec3(0.3, 0.2, 0.1));
	me.instance(scene);

	facebox.private.env_heaven = me.public;

	me.mouseControl = cursor;

	// var spawner = new Spawner;
	// spawner.start(scene);
}
