function initializeShaders(webGL, options) {
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
		}`,

		options
	);

	shaders.facebox = new Shader(
		webGL,
		
		`attribute vec3 a_Position;
		attribute vec2 a_UV;

		uniform mat4 u_MVMatrix;

		varying vec3 v_Position;

		void main(void) {
			v_Position = a_Position.xyz;

			vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
			vec3 position3 = position4.xyz / position4.w;

			gl_Position = position4;
		}`,

		`precision lowp float;

		uniform vec2 u_Mouse;
		uniform vec2 u_Resolution;

		varying vec3 v_Position;

		const float R = 0.65;
		const float D = 0.05;
		const float sqwidth = 0.0055;
		const float attenuation = 0.003;
		const float minangle = 0.3490658503988659;

		float angle(vec2 v0, vec2 v1) {
			float scalar = v0.x * v1.x + v0.y * v1.y;
			float module = sqrt(pow(v0.x, 2.0) + pow(v0.y, 2.0)) * sqrt(pow(v1.x, 2.0) + pow(v1.y, 2.0));
			return acos(scalar / module);
		}

		vec4 pixel(vec2 position) {
			vec4 frag = vec4(0.0);

			vec2 dir = normalize(u_Mouse);

			vec2 normal = normalize(position);
			float an = angle(dir, normal);

			float sqan = angle(dir, vec2(1.0, 0.0));
			if (dir.y < 0.0) {
				sqan = -sqan;
			}
			float sqcos = cos(sqan);
			float sqsin = sin(sqan);
			mat2 Mrot = mat2(sqcos, -sqsin, sqsin, sqcos);

			vec2 avg = dir * R;
			vec2 pos = Mrot * vec2(position.x - avg.x, position.y - avg.y);
			float square = abs(pos.x) + abs(pos.y);

			float radius = sqrt(pow(position.x, 2.0) + pow(position.y, 2.0));
			if (radius > R) {
				if (square <= D) {
					if (square >= D - sqwidth) {
						frag = vec4(1.0);
					}
				}
				else if (an < minangle) {
					frag = vec4(1.0) * min(R / (radius - R) * attenuation, 1.0);
				}
			}

			float bright = min(sqrt(pow(u_Mouse.x, 2.0) + pow(u_Mouse.y, 2.0)), 1.0);

			return bright * frag;
		}

		void main() {
			vec2 res = vec2(1.0 / u_Resolution.x, 1.0 / u_Resolution.y);

			vec4 O = pixel(v_Position.xy);

			gl_FragColor = O;
		}`
	);
}
