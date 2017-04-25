function gameplay({
	images,
	canvas,
	cursor
}) {
	canvas.appendTo(document.body);

	// initialize project, set as default image "Transparent"
	var project = new Project;
	project.attachCanvas(canvas);

	// initialize webGLRenderer and set attributes
	project.initializeWebGLRenderer({
		attributes: {
			antialias: 'FXAAx2'
		}
	});

	// Initialize all shaders in project
	initializeShaders(project.webGLRenderer.webGL, {
		transparentImage: images.transparent
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
	// each data distribution from server are using in logic
	Server.player.ondistribution = logic.updateItems;

	/**
	 * Determine player's object, bind cursor, scale
	 * to the required diameter to skip perframe scaling
	 * at the begin
	 */
	player = new Player({
		scene: scene,
		cursor: cursor,
		camera: camera
	});

	// direction pointer
	var facebox = new FaceBox({
		cursor: cursor
	});
	facebox.instance(scene, true);

	// get all data from server for playing and start project
	logic.getData(project);
}
