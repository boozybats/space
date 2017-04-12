class Logic {
	constructor(scene) {
		this.updateItems = this.updateItems.bind(this);
		this.scene = scene;
	}

	createitem(type, data) {
		var item;

		switch (type) {
			case 'heaven':
			item = new Heaven;
			item.uptodate(data);

			break;
		}

		return item;
	}

	updateItems(data) {
		if (typeof data !== 'object') {
			return;
		}

		var scene = this.scene;
		
		// data with all existing items
		for (var i = 0; i < data.length; i++) {
			var wrap = data[i];
			var id = wrap.id;

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
}
