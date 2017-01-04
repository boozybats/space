class Vertices {
	static array(...vertices) {
		var out = [];

		for (var vertex of vertices) {
			out.push(new Vec3(
				vertex[0],
				vertex[1],
				vertex[2]
			));
		}

		return out;
	}
}
