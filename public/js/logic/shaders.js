function initializeShaders(webGL) {
	shaders.heaven = new Shader(
		webGL,
		
		`#define MAX_LIGHTS 8

		struct Light {
			vec4  ambient;
			vec4  diffuse;
			vec4  specular;
			vec3  position;
			float type;
			float intensity;
		};

		attribute vec3 a_Position;
		attribute vec3 a_Normal;
		attribute vec2 a_UV;

		uniform mat4 u_MVMatrix;
		uniform mat4 u_MVPMatrix;
		uniform mat3 u_MVNMatrix;
		uniform Light u_Lights[MAX_LIGHTS];

		varying vec4 v_LightAmbient[MAX_LIGHTS];
		varying vec4 v_LightDiffuse[MAX_LIGHTS];
		varying vec2 v_UV;

		void main(void) {
			vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
			gl_Position = u_MVPMatrix * position4;

			v_UV = a_UV;

			vec3 position3 = position4.xyz / position4.w;
			vec3 normal = normalize(u_MVNMatrix * a_Normal);

			for (int i = 0; i < MAX_LIGHTS; i++) {
				Light light = u_Lights[i];
				if (light.type != 2.0) {
					continue;
				}

				vec3 dir = normalize(light.position - position3);
				float cosTheta = clamp(dot(normal, dir), 0.0, 1.0);

				float dist = distance(position3, light.position);

				v_LightDiffuse[i] = light.diffuse * light.intensity * cosTheta / pow(dist, 2.0);
				v_LightAmbient[i] = light.ambient;
			}
		}`,

		`precision mediump float;

		#define MAX_LIGHTS 8

		struct Material {
			vec4 ambient;
			vec4 diffuse;
			vec4 specular;
			sampler2D ambientmap;
			sampler2D diffusemap;
			sampler2D specularmap;
			sampler2D normalmap;
		};

		uniform Material u_Material;

		varying vec4 v_LightAmbient[MAX_LIGHTS];
		varying vec4 v_LightDiffuse[MAX_LIGHTS];
		varying vec2 v_UV;

		void main(void) {
			vec4 diffuseTex = texture2D(u_Material.diffusemap, v_UV);

			vec4 color = vec4(0.0);

			for (int i = 0; i < MAX_LIGHTS; i++) {
				vec4 ambient = u_Material.ambient * v_LightAmbient[i];
				vec4 diffuse = diffuseTex * v_LightDiffuse[i];
				color += ambient + diffuse;
			}

			color = vec4(
				min(color.x, diffuseTex.x),
				min(color.y, diffuseTex.y),
				min(color.z, diffuseTex.z),
				min(color.w, diffuseTex.w)
			);

			gl_FragColor = color;
		}`
	);
}
