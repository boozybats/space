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
		var out = [];
		var matrix = Mat.multi(this.mvmatrix, renderer.mvpmatrix);

		var vertices = this.mesh_.vertices;
		if (vertices && vertices.length) {
			var ctx = renderer.ctx;

			var isFirstPoint = true;
			ctx.beginPath();
			for (var vertex of vertices) {
				var vec = matrix.Vec(vertex);
				out.push(vec);

				var x = vec.x;
				var y = vec.y;
				var z = vec.z;

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

		return out;
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

	get physic() {
		return this.physic_;
	}
}
