function gameplay(images) {
	var diffuseShader = new Shader(
		`attribute vec3 a_Position;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;
		varying vec2 v_TexPosition;
		void main(void) {
			v_TexPosition = vec2(a_Position);
			gl_Position = u_MVPMatrix * u_MVMatrix * vec4(a_Position, 1.0);
		}`,
		`precision highp float;
		uniform sampler2D u_Sampler;
		varying vec2 v_TexPosition;
		void main(void) {
			gl_FragColor = texture2D(u_Sampler, v_TexPosition);
		}`
	);

	var project = new Project({
		transparentImage: images.transparent
	});
	project.attachCanvas(canvas);

	project.initializeWebGLRenderer();
	var webGLRenderer = project.webGLRenderer;
	var gl = webGLRenderer.webGL;

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

	for (var i = 0; i < 1; i++) {
		var heaven = new Heaven({
			shader: diffuseShader
		});
		heaven.appendToScene(scene);
	}
}
