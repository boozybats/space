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

	var facebox = new FaceBox;
	facebox.instance(scene);

	var me = new Heaven;
	me.bindCamera(camera);
	me.rotate(new Vec3(0.3, 0.2, 0.1));
	me.instance(scene);

	cursor = new Cursor;
	me.mouseControl = cursor;
}
