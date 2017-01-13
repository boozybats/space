var diffuseShader = new Shader(
	`attribute vec3 a_Position;
	uniform mat4 u_MVMatrix;
	uniform mat4 u_MVPMatrix;
	void main(void) {
		gl_Position = u_MVPMatrix * u_MVMatrix * vec4(a_Position, 1.0);
	}`,
	`void main(void) {
		gl_FragColor = vec4(1.0, 1.0, 0.5, 1.0);
	}`
);

function gameplay() {
	var project = new Project;

	project.attachCanvas(canvas);

	project.initializeWebGLRenderer();
	var webGLRenderer = project.webGLRenderer;
	var gl = webGLRenderer.webGL;
	webGLRenderer.setup();

	//var shader = diffuseShader.initialize(gl);

	var sceneName = 'main';
	var scene = project.createNewScene(sceneName);
	project.selectScene(sceneName);

	var camera = new Camera;
	camera.body = new Body({
		position: new Vec3(0, 0, -500),
		rotation: Quaternion.Euler(0, 0, 90)
	});
	scene.appendCamera(camera);

	project.start();

	var heaven = new Heaven({
		shader: diffuseShader
	});
	heaven.appendToScene(scene);

	console.log(project);
}
