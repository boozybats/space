// SHADERS
	var lambertianShader = new Shader(
		`attribute vec3 a_Position;
		attribute vec3 a_Normal;
		attribute vec2 a_UI;

		uniform mat4 u_MVMatrixEye;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;
		uniform mat3 u_MVNMatrix;

		void main(void) {
			vec4 position = u_MVMatrix * vec4(a_Position, 1.0);
			gl_Position = u_MVPMatrix * position;
		}`,

		`precision highp float;

		uniform vec4 u_Color;

		void main(void) {
			gl_FragColor = u_Color;
		}`
	);

	var heavenShader = new Shader(
		`attribute vec3 a_Position;
		attribute vec3 a_Normal;
		attribute vec2 a_UI;

		uniform mat4 u_MVMatrixEye;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;
		uniform mat3 u_MVNMatrix;

		varying vec2 v_UI;
		varying float v_Distance;

		void main(void) {
			v_UI = a_UI;

			vec4 position = u_MVMatrix * vec4(a_Position, 1.0);

			v_Distance = sqrt(pow(a_Position.x, 2.0) + pow(a_Position.y, 2.0) + pow(a_Position.z, 2.0));
			gl_Position = u_MVPMatrix * position;
		}`,

		`precision highp float;

		uniform vec4 u_Color;
		uniform float u_Radius;
		uniform sampler2D u_NormalMap;

		varying vec2 v_UI;
		varying float v_Distance;

		const float thickness = 0.035;

		void main(void) {
			float difference = u_Radius - v_Distance;
			vec4 color;
			if (difference < u_Radius * thickness) {
				color = vec4(1.0, 1.0, 1.0, 1.0);
			}
			else {
				color = texture2D(u_NormalMap, v_UI);
			}

			gl_FragColor = color;
		}`
	);

	var heavenShader2 = new Shader(
		`attribute vec3 a_Position;
		attribute vec3 a_Normal;
		attribute vec2 a_UI;

		uniform mat4 u_MVMatrixEye;
		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;
		uniform mat3 u_MVNMatrix;

		varying vec2 v_UI;
		varying float v_Distance;

		void main(void) {
			v_UI = a_UI;

			vec4 position = u_MVMatrix * vec4(a_Position, 1.0);

			v_Distance = sqrt(pow(a_Position.x, 2.0) + pow(a_Position.y, 2.0) + pow(a_Position.z, 2.0));
			gl_Position = u_MVPMatrix * position;
		}`,

		`precision highp float;

		uniform vec4 u_Color;
		uniform float u_Radius;
		uniform sampler2D u_IM;

		varying vec2 v_UI;
		varying float v_Distance;

		const float thickness = 0.035;

		void main(void) {
			float difference = u_Radius - v_Distance;
			vec4 color;
			if (difference < u_Radius * thickness) {
				color = vec4(1.0, 1.0, 1.0, 1.0);
			}
			else {
				color = texture2D(u_IM, v_UI);
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
