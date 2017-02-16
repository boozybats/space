class SpaceBox extends UI {
	constructor({
		name = 'spacebox'
	} = {}) {
		super({
			name
		});

		this.startTime_ = new Date().getTime() / 1000;

		this.mesh.shader = SpaceBox.shader;
		this.mesh.uniforms['resolution'] = new Vec2(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
		this.mesh.uniforms['mouse'] = new Vec2;
		this.mesh.uniforms['time'] = this.startTime_;

		this.body.position = new Vec3(0, 0, 0.99);
	}

	set offset(val) {
		if (val instanceof Vec2) {
			this.mesh.uniforms['u_Offset'] = val;
		}
	}

	onupdate({
		currentTime
	}) {
		this.changeUniforms({
			mouse: Vec.dif(cursor.body.position.xy.multi(0.5), new Vec2(0.5, 0.5)),
			time: currentTime - this.startTime_
		});
	}

	static get shader() {
		var out = new Shader(
			`precision highp float;

			attribute vec3 a_Position;
			attribute vec2 a_UI;

			uniform mat4 u_MVMatrix;

			varying vec2 v_UI;

			void main(void) {
				v_UI = a_UI;

				gl_Position = u_MVMatrix * vec4(a_Position, 1.0);
			}`,

			`#ifdef GL_ES
			precision mediump float;
			#endif

			uniform float time;
			uniform vec2 mouse;
			uniform vec2 resolution;

			#define pi 3.14159265359

			void main() {
				vec2 pos=(gl_FragCoord.xy/resolution.y);
				pos.x-=resolution.x/resolution.y/2.0;pos.y-=0.5;

				float f = 4.0;
				float tn = mod(time, 2.0*pi*f) -pi*f;	
				float t = pos.x*f*pi;	
				float fx=sin(t+time)/6.0;
				float rs=distance(t, tn);
				float dist=abs(pos.y-fx)*80.0*sqrt(rs);	
				gl_FragColor+=vec4(0.5/dist,0.5/dist,1.0/dist,1.0);

				f = 4.0;
				tn = mod(mouse.x*2.0*pi*f, 2.0*pi*f) -pi*f;	
				t = pos.x*f*pi;	
				fx=sin(pos.x*9.0-time)/8.0;
				rs=distance(t, tn);
				dist=abs(pos.y-fx)*80.0*sqrt(rs);
				gl_FragColor+=vec4(1.0/dist,0.5/dist,0.5/dist,1.0);

				if (pos.y<=-0.2) {
					gl_FragColor+=vec4(abs(pos.y+0.2),abs(pos.y+0.2),abs(pos.y+0.2),1.0);
				}
			}`
		);

		return out;
	}
}
