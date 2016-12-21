const RESOLUTION_WIDTH = 1820;
const RESOLUTION_HEIGHT = 1024;

var Mouse = {
	w: 20,
	h: 30,
	x: 0,
	y: 0,
	
};

Loader.images({
	mouse: 'images/mouse.png'
}, (images) => {
	window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.webkitRequestAnimationFrame;

	// CANVAS APPEND
	canvas = document.createElement('canvas');
	canvas.width = RESOLUTION_WIDTH;
	canvas.height = RESOLUTION_HEIGHT;

	document.body.appendChild(canvas);

	// POINTER LOCK IDENTIFICATION
	function isLocked() {
		return canvas === document.pointerLockElement ||
			canvas === document.mozPointerLockElement ||
			canvas === document.webkitPointerLockElement;
	}

	var exitPointerLock = document.exitPointerLock ||
		document.mozExitPointerLock  ||
		document.webkitExitPointerLock;

	canvas.requestPointerLock = canvas.requestPointerLock ||
		canvas.mozRequestPointerLock ||
		canvas.webkitRequestPointerLock;

	canvas.addEventListener('click', () => {
		if (!isLocked()) {
			canvas.requestPointerLock();
		}
	});

	canvas.addEventListener('mousemove', (event) => {
		if (isLocked()) {
			var x = event.movementX;
			var y = event.movementY;

			Mouse.x += x;
			Mouse.y += y;

			if (Mouse.x < 0) {
				Mouse.x = 0;
			}
			else if (Mouse.x > canvas.width - Mouse.w) {
				Mouse.x = canvas.width - Mouse.w;
			}

			if (Mouse.y < 0) {
				Mouse.y = 0;
			}
			else if (Mouse.y > canvas.height - Mouse.h) {
				Mouse.y = canvas.height - Mouse.h;
			}
		}
	});
	// \POINTER LOCK IDENTIFICATION
	// \CANVAS APPEND

	// AUTORESIZE
	var onresize;
	;(onresize = function() {
		var  ratio = RESOLUTION_WIDTH / RESOLUTION_HEIGHT


		var win = {
			w: window.innerWidth,
			h: window.innerHeight
		};

		if (win.w / ratio > win.h) {
			canvas.style.height = '100%';
			var height = canvas.offsetHeight;
			var width = height * ratio;
			canvas.style.width = width + 'px';
			canvas.style.marginLeft = (win.w - width) / 2 + 'px';
			canvas.style.marginTop = 0;
		}
		else {
			canvas.style.width = '100%';
			var width = canvas.offsetWidth;
			var height = width / ratio;
			canvas.style.height = height + 'px';
			canvas.style.marginLeft = 0;
			canvas.style.marginTop = (win.h - height) / 2 + 'px';
		}
	})();
	window.onresize = onresize;
	// \AUTORESIZE

	var renderer = new Renderer(canvas);
	var mouse_buffer = new Buffer({
		image: function() {
			return images.mouse;
		},
		h: function() {
			return Mouse.h;
		},
		w: function() {
			return Mouse.w;
		},
		x: function() {
			return Mouse.x;
		},
		y: function() {
			return Mouse.y;
		}
	});
	renderer.add(mouse_buffer);
	renderer.execution();
});
