class Item {
	constructor({
		body = new Body,
		mesh = new Mesh
	} = {}) {
		this.body_ = body;
		this.mesh_ = mesh;
	}

	get body() {
		return this.body_;
	}

	draw(renderer) {
		var matrix = Mat.multi(this.mvmatrix, renderer.mvpmatrix);

		var vertices = this.mesh_.vertices;
		if (vertices && vertices.length) {
			var ctx = renderer.ctx;

			var isFirstPoint = true;
			ctx.beginPath();
			for (var vertex of vertices) {
				var vec = matrix.Vec(vertex);
				var z = vec.z;
				z = z > 0 ? 1 / z : -z;
				console.one('1', () => console.log(vec.x, vec.y));
				var x = vec.x / z;
				var y = vec.y / z;

				if (isFirstPoint) {
					isFirstPoint = false;
					ctx.moveTo(x, y);
				}
				else {
					ctx.lineTo(x, y);
				}
			}
			ctx.closePath();

			if (this.mesh.fillStyle_) {
				ctx.fillStyle = this.mesh.fillStyle_;
				ctx.fill();
			}
			else if (this.mesh.strokeStyle_) {
				ctx.strokeStyle = this.mesh.strokeStyle_;
				ctx.stroke();
			}
		}
	}

	get mesh() {
		return this.mesh_;
	}

	get mvmatrix() {
		var matS, matR, matT, mvmatrix;
		var body = this.body;

		do {
			matS = Mat4.scale(body.scale);
			matR = Mat4.rotate(body.rotation);
			matT = Mat4.translate(body.position);
			mvmatrix = mvmatrix ? Mat.multi(mvmatrix, matS, matR, matT) : Mat.multi(matS, matR, matT);

			body = body.parent;
		}
		while(body);

		return mvmatrix;
	}
}
