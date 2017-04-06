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

	updateItems(data) {
		if (typeof data !== 'object') {
			return;
		}
		
		// data with all existing items
		for (var i = data.length; i--;) {
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
