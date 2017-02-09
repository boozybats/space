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

	var camera = new Camera;
	camera.body.position = new Vec3(0, 0, -5);
	scene.appendCamera(camera);

	var light = new PointLight({
		body: new Body({
			parent: camera.body
		})
	});
	scene.addLight(light);

	project.start();

	cursor = new Cursor();
	camera.bindUI(cursor);

	var me = new Sphere({
		precision: 3
	});
	me.rotate(new Vec3(0.1, 0.2, 0.3));
	me.instance(scene);
	me.mouseControl = cursor;
}
