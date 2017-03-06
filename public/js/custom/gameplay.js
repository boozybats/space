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
	scene.appendCamera(camera);

	var light = new PointLight({
		body: new Body({
			parent: camera.body
		})
	});
	scene.addLight(light);
	
	cursor = new Cursor;

	var facebox = new FaceBox;
	facebox.instance(scene, true);

	var me = new Heaven({
		name: 'me'
	});
	me.instance(scene, true);
	me.me();
	me.rotate(new Vec3(0, 1));
	me.bindCamera(camera);
	me.body.scale = amc('+', new Vec3, me.physic.diameter);

	facebox.private.env_heaven = me.public;

	me.mouseControl = cursor;

	scene.callbacks.push(
		function() {
			server.items(response => {
				var data = response.data;

				for (var id in data) {
					var it = data[id];
					var item = scene.findItem(id);

					if (item) {
						item.body.position = new Vec3(...it.position);

						if (!item.physic.matter.compare(it.matter)) {
							item.physic.init_matter(it.matter);
						}
					}
					else {
						var item = new Heaven({
							id: id,
							body: new Body({
								position: new Vec3(...it.position)
							}),
							physic: new Physic({
								matter: it.matter
							})
						});
						item.instance(scene);
					}
				}

				var items = scene.items;
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (!data[item.id]) {
						item.remove();
					}
				}
			});
		}
	);

	server.getid(id => {
		me.id = id;
		project.start();
	});
}
