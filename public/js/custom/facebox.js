class FaceBox extends UI {
	constructor({
		name = 'facebox'
	} = {}) {
		super({
			name,
			width: RESOLUTION_MIN,
			height: RESOLUTION_MIN
		});

		this.startTime_ = new Date().getTime() / 1000;

		this.mesh.shader = FaceBox.shader;
		this.mesh.uniforms['u_Mouse'] = new Vec2;
		this.mesh.uniforms['u_Time'] = this.startTime_;

		this.body.position = new Vec3(0, 0, 0);
	}

	onupdate({
		currentTime
	}) {
		var mouse = cursor.position;
		var time = currentTime - this.startTime_;

		this.changeUniforms({
			u_Mouse: mouse,
			u_Time: time
		});
	}

	static get shader() {
		var out = new Shader(
			`attribute vec3 a_Position;
			attribute vec2 a_UI;

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
			uniform float u_Time;

			varying vec3 v_Position;

			const float R = 0.65;
			const float D = 0.05;
			const float sqwidth = 0.008;
			const float attenuation = 0.005;
			const float minangle = 0.3490658503988659;

			float angle(vec2 v0, vec2 v1) {
				float scalar = v0.x * v1.x + v0.y * v1.y;
				float module = sqrt(pow(v0.x, 2.0) + pow(v0.y, 2.0)) * sqrt(pow(v1.x, 2.0) + pow(v1.y, 2.0));
				return acos(scalar / module);
			}

			void main() {
				float intensity = 0.0;

				vec2 dir = normalize(u_Mouse);
				float dirlength = sqrt(pow(dir.x, 2.0) + pow(dir.y, 2.0));

				vec2 normal = normalize(v_Position.xy);
				float an = angle(dir, normal);

				vec2 sp = vec2(1.0, 0.0);
				float sqan = angle(dir, sp);
				if (dir.y < 0.0) {
					sqan = -sqan;
				}
				float sqcos = cos(sqan);
				float sqsin = sin(sqan);
				mat2 Mrot = mat2(sqcos, -sqsin, sqsin, sqcos);

				vec2 avg = dir * R;
				vec2 pos = Mrot * vec2(v_Position.x - avg.x, v_Position.y - avg.y);
				float square = abs(pos.x) + abs(pos.y);

				float radius = sqrt(pow(v_Position.x, 2.0) + pow(v_Position.y, 2.0));
				if (radius > R) {
					if (square <= D) {
						if (square >= D - sqwidth) {
							intensity = 1.0;
						}
					}
					else if (an < minangle) {
						intensity = min(R / (radius - R) * attenuation, 1.0);
					}
				}

				float bright = min(sqrt(pow(u_Mouse.x, 2.0) + pow(u_Mouse.y, 2.0)), 1.0);

				gl_FragColor = intensity * bright * vec4(1.0);
			}`
		);

		return out;
	}
}
