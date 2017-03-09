const FPS = 1000 / 60;
const RESOLUTION_MAX = Math.max(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
const RESOLUTION_MIN = Math.min(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

var canvas;
var cursor;

loader({
	transparent: 'images/transparent.jpg'
}, images => {
	// REQUEST ANIMATION FRAME
	window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.webkitRequestAnimationFrame;
	// \REQUEST ANIMATION FRAME

	// CANVAS APPEND
	canvas = new Canvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
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

	canvasdom.addEventListener('mousemove', event => {
		if (isLocked()) {
			cursor.axis = new Vec2(
				event.movementX / RESOLUTION_WIDTH,
				-event.movementY / RESOLUTION_HEIGHT
			);
		}
	});
	// \POINTER LOCK IDENTIFICATION
	// \CANVAS APPEND

	// AUTORESIZE
	var cssheight, csswidth;
	function onresize() {
		var parent = canvasdom.parentNode;
		if (parent) {
			var ratio = RESOLUTION_WIDTH / RESOLUTION_HEIGHT

			var win = {
				w: parent.offsetWidth,
				h: parent.offsetHeight
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
		}
	}
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
