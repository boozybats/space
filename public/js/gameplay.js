// SHADERS

	var diffuseShader = new Shader(
		`attribute vec3 a_Position;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;

		void main(void) {
			gl_Position = u_MVPMatrix * u_MVMatrix * vec4(a_Position, 1.0);
		}`,

		`void main(void) {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}`
	);

	var heavenShader = new Shader(
		`attribute vec3 a_Position;
		attribute vec3 a_Normal;
		attribute vec2 a_UI;

		uniform vec3 u_EyePosition;
		uniform mat3 u_MVNMatrix;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;

		varying vec3 v_Normal;
		varying vec3 v_LightDirection;
		varying vec2 v_UI;
		varying float v_Distance;

		void main(void) {
			v_UI = a_UI;

			vec4 position = u_MVMatrix * vec4(a_Position, 1.0);

			v_Normal = u_MVNMatrix * a_Normal;
			v_LightDirection = normalize(u_EyePosition - vec3(position));
			v_Distance = sqrt(pow(a_Position.x, 2.0) + pow(a_Position.y, 2.0) + pow(a_Position.z, 2.0));
			
			gl_Position = u_MVPMatrix * position;
		}`,

		`precision highp float;

		uniform float u_Radius;
		uniform vec4 u_Color;
		uniform sampler2D u_NormalMap;

		varying vec3 v_Normal;
		varying vec3 v_LightDirection;
		varying vec2 v_UI;
		varying float v_Distance;

		void main(void) {
			vec3 texel = texture2D(u_NormalMap, v_UI).rgb * 2.0 - 1.0;

			const float thickness = 0.035;
			float difference = u_Radius - v_Distance;
			vec4 color;
			if (difference < u_Radius * thickness) {
				color = vec4(1.0, 1.0, 1.0, 1.0);
			}
			else {
				color = u_Color;
			}
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

	project.start();

	var heaven = new Heaven({
		shader: heavenShader
	});
	heaven.instance(scene);
}
// \GAMEPLAY
