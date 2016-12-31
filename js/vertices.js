class Vertices {
	static array(...vertices) {
		var out = [];

		for (var vertex of vertices) {
			out.push(
				vertex[0] || 0,
				vertex[1] || 0,
				vertex[2] || 0
			);
		}

		return out;
	}
}
