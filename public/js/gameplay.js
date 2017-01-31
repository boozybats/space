// GAMEPLAY
function gameplay(images) {
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
	camera.body = new Body({
		position: new Vec3(0, 0, -500)
	});
	scene.appendCamera(camera);
	
	scene.addLight(new PointLight({
		body: new Body({
			position: new Vec3(300, 300, -400)
		})
	}));

	project.start();

	cursor = new Cursor();
	camera.bindMouse(cursor);

	var me = new Heaven({
		shader: Heaven.shader
	});
	me.instance(scene);
	me.rotate();
	me.mouseControl(1);

	camera.follow(me.body);
}
// \GAMEPLAY
