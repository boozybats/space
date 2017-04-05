class Logic extends Empty {
	constructor(scene) {
		super();

		this.instance(scene, true);
	}

	createitem(type, data) {
		var item;

		switch (type) {
			case 'heaven':
			item = new Heaven;
			item.uptodate(data);

			break;
		}

		return out;
	}

	onupdate() {
		Server.items.getAll(data => {
			// data with all existing items
			for (var id in data) {
				if (data.hasOwnProperty(id)) {
					var wrap = data[id];

					// try find existing item on scene
					var item = scene.findItem(id);

					if (item) {
						item.uptodate(wrap.data);
					}
					else {
						this.createitem(wrap.type, wrap.data);
					}
				}
			}
		});
	}
}
