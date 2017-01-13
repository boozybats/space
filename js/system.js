const FPS = 1000 / 60;
const RESOLUTION_WIDTH = 1920;
const RESOLUTION_HEIGHT = 1080;

var canvas;
var Mouse = {
	w: 30,
	h: 45,
	x: RESOLUTION_WIDTH / 2,
	y: RESOLUTION_HEIGHT / 2,
	forceback: false,
	keepchase: true
};

Loader.images({
	mouse: 'images/mouse.png'
}, (images) => {
	window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.webkitRequestAnimationFrame;

	// CANVAS APPEND
	canvas = new Canvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
	var canvasdom = canvas.canvas;
	canvas.appendTo(document.body);

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
	canvasdom.addEventListener('mousemove', (event) => {
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

	// MOUSE
	Mouse.draw = function(renderer) {
		renderer.draw(images.mouse, this.x, this.y, this.w, this.h);
	}

	var forceback_koeff = 500;
	var forceback_min = 1;
	var centerx = RESOLUTION_WIDTH / 2;
	var centery = RESOLUTION_HEIGHT / 2;
	setInterval(function() {
		if (Mouse.forceback) {
			if (Mouse.x < centerx - forceback_min || Mouse.x > centerx + forceback_min) {
				var interval = (Mouse.x - centerx) / forceback_koeff;
				Mouse.x -= interval;
			}

			if (Mouse.y < centery - forceback_min || Mouse.y > centery + forceback_min) {
				var interval = (Mouse.y - centery) / forceback_koeff;
				Mouse.y -= interval;
			}
		}
	}, FPS);
	// \MOUSE

	gameplay();
});

// SHOW ONCE AT SESSION
var consoleoneusednames = [];
console.one = function(name, callback) {
	if (consoleoneusednames.indexOf(name) == -1) {
		consoleoneusednames.push(name);
		callback();
	}
}
