const FPS = 1000 / 60;
const RESOLUTION_WIDTH = screen.width;
const RESOLUTION_HEIGHT = screen.height;

var canvas;
var Mouse = {
	w: 30,
	h: 45,
	x: RESOLUTION_WIDTH / 2,
	y: RESOLUTION_HEIGHT / 2,
	forceback: false,
	keepchase: false
};

Loader.images({
	mouse: 'images/mouse.png',
	transparent: 'images/transparent.jpg'
}, images => {
	window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.webkitRequestAnimationFrame;

	// CANVAS APPEND
	canvas = new Canvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
	canvas.appendTo(document.body);
	var canvasdom = canvas.canvas;

	// POINTER LOCK IDENTIFICATION
	function isLocked() {
		return canvasdom === document.pointerLockElement ||
			canvasdom === document.mozPointerLockElement ||
			canvasdom === document.webkitPointerLockElement;
	}

	var exitPointerLock = document.exitPointerLock ||
		document.mozExitPointerLock  ||
		document.webkitExitPointerLock;

	canvasdom.requestPointerLock = canvasdom.requestPointerLock ||
		canvasdom.mozRequestPointerLock ||
		canvasdom.webkitRequestPointerLock;

	canvasdom.addEventListener('click', () => {
		if (!isLocked()) {
			canvasdom.requestPointerLock();
		}
	});

	var mousehidden = false;
	canvasdom.addEventListener('mousemove', event => {
		if (isLocked()) {
			var x = event.movementX;
			var y = event.movementY;

			Mouse.x += x;
			Mouse.y += y;
		}
		else if (Mouse.keepchase) {
			var x = event.layerX / csswidth * RESOLUTION_WIDTH;
			var y = event.layerY / cssheight * RESOLUTION_HEIGHT;

			Mouse.x = x;
			Mouse.y = y;

			if (!mousehidden) {
				mousehidden = true;
				canvasdom.style.cursor = 'none';
			}
		}
		else {
			if (mousehidden) {
				mousehidden = false;
				canvasdom.style.cursor = 'default';
			}
		}

		if (Mouse.x < 0) {
			Mouse.x = 0;
		}
		else if (Mouse.x > RESOLUTION_WIDTH) {
			Mouse.x = RESOLUTION_WIDTH;
		}

		if (Mouse.y < 0) {
			Mouse.y = 0;
		}
		else if (Mouse.y > RESOLUTION_HEIGHT) {
			Mouse.y = RESOLUTION_HEIGHT;
		}
	});
	// \POINTER LOCK IDENTIFICATION
	// \CANVAS APPEND

	// AUTORESIZE
	var cssheight, csswidth;
	var onresize;
	;(onresize = function() {
		var  ratio = RESOLUTION_WIDTH / RESOLUTION_HEIGHT

		var win = {
			w: window.innerWidth,
			h: window.innerHeight
		};

		if (win.w / ratio > win.h) {
			canvasdom.style.height = '100%';
			var height = cssheight = canvasdom.offsetHeight;
			var width = csswidth = height * ratio;
			canvasdom.style.width = width + 'px';
			canvasdom.style.marginLeft = (win.w - width) / 2 + 'px';
			canvasdom.style.marginTop = 0;
		}
		else {
			canvasdom.style.width = '100%';
			var width = csswidth = canvasdom.offsetWidth;
			var height = cssheight = width / ratio;
			canvasdom.style.height = height + 'px';
			canvasdom.style.marginLeft = 0;
			canvasdom.style.marginTop = (win.h - height) / 2 + 'px';
		}
	})();
	window.onresize = onresize;
	// \AUTORESIZE

	gameplay(images);
});

// SHOW ONCE AT SESSION
var consoleoneusednames = [];
console.one = function(name, callback) {
	if (consoleoneusednames.indexOf(name) == -1) {
		consoleoneusednames.push(name);
		callback();
	}
}
