// SHADERS
var heavenShader = new Shader(
	`precision mediump float;

	attribute vec3 a_Position;
	attribute vec3 a_Normal;
	attribute vec2 a_UI;

	const int MAX_POINTLIGHTS = 16;

	uniform mat4 u_MVMatrix;
	uniform mat4 u_MVPMatrix;
	uniform mat3 u_MVNMatrix;
	uniform vec3 u_PointLights[MAX_POINTLIGHTS];

	varying float v_LightWeighting;
	varying vec2 v_UI;

	void main(void) {
		v_UI = a_UI;

		vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
		vec3 position3 = position4.xyz / position4.w;

		vec3 lightDirection = normalize(u_PointLights[0] - position3);

		vec3 normal = normalize(u_MVNMatrix * a_Normal);

		v_LightWeighting = max(dot(normal, lightDirection), 0.0);

		gl_Position = u_MVPMatrix * position4;
	}`,

	`precision mediump float;

	varying float v_LightWeighting;
	varying vec2 v_UI;
	uniform sampler2D u_NormalMap;

	void main(void) {
		vec4 color = texture2D(u_NormalMap, v_UI);
		gl_FragColor = vec4(color.rgb * v_LightWeighting, color.a);
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
			position: new Vec3(0, 0, -1)
		})
	}));

	project.start();

	var heaven = new Heaven({
		shader: heavenShader
	});
	heaven.instance(scene);
}
// \GAMEPLAY
