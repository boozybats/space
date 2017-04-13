class Logic {
	constructor(scene) {
		this.scene = scene;

		this.updateItems = this.updateItems.bind(this);
	}

	get scene() {
		return this.scene_;
	}
	set scene(val) {
		if (!(val instanceof Scene)) {
			throw new Error('Logic: scene: must be a Scene');
		}

		this.scene_ = val;
	}

	createitem(type, data) {
		var item;

		switch (type) {
			case 'heaven':
			item = new Heaven;
			item.instance(this.scene);
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
			var item = scene.findItem('id', id);

			if (item) {
				item.uptodate(wrap);
			}
			else {
				this.createitem(wrap.type, wrap);
			}
		}
	}
}
