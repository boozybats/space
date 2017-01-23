// SHADERS
var heavenShader = new Shader(
	`precision mediump float;

	attribute vec3 a_Position;
	attribute vec3 a_Normal;
	attribute vec2 a_UI;

	uniform mat4 u_MVMatrixEye;
	uniform mat4 u_MVMatrix;
	uniform mat4 u_MVPMatrix;
	uniform mat3 u_MVNMatrix;
	uniform vec3 u_PointLights[8];

	varying vec4 v_EyeVec;
	varying vec3 v_Normal;
	varying vec3 v_LightDirection;
	varying vec2 v_UI;

	void main(void) {
		v_UI = a_UI;
		v_Normal = u_MVMatrix * a_Normal;

		vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
		vec3 position3 = vec3(position4);

		v_LightDirection = u_PointLights[0] - position3;
		v_EyeVec = -position3;

		gl_Position = u_MVPMatrix * position4;
	}`,

	`precision mediump float;

	uniform vec4 u_Color;
	uniform sampler2D u_NormalMap;

	const vec4 ambientColor = vec4(1.0, 1.0, 1.0, 1.0);
	const vec4 specularColor = vec(0.0, 0.0, 0.0, 0.0);
	const float shininess = 0.9;

	varying vec2 v_UI;

	void main(void) {
		vec4 color = texture2D(u_NormalMap, v_UI);

		gl_FragColor = color;
	}`
);
// \SHADERS

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
	var scene = project.createNewScene(sceneName);
	project.selectScene(sceneName);

	var camera = new Camera;
	camera.body = new Body({
		position: new Vec3(0, 0, -500),
		rotation: Quaternion.Euler(0, 0, 90)
	});
	scene.appendCamera(camera);
	scene.addLight(new PointLight({
		body: new Body({
			position: new Vec3(0, 0, -500)
		})
	}));

	project.start();

	var heaven = new Heaven({
		shader: heavenShader
	});
	heaven.instance(scene);
}
// \GAMEPLAY
