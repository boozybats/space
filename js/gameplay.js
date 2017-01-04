const UNIT = 100;

function gameplay() {
	var renderer = new Renderer(canvas);
	renderer.execution();
	renderer.add(Mouse);

	var h = new Heaven({
		body: new Body({
			position: new Vec3(0, 0, 0),
			scale: new Vec3(UNIT, UNIT)
		}),
		renderer: renderer
	});
	renderer.add(h);
}
