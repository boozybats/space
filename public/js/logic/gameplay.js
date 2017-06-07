;
(function() {
    // Make game and initialize it by custom options
    var game = new Game;
    game.initialize({
        canvas: {
            dom: document.body
        },
        graphic: {
            antialias: 'FXAAx2'
        }
    });

    // Set dependency transparent image for shaders
    game.setDependencies([{
        type: 'image',
        name: 'transparentImage',
        src: 'images/default/transparent.png'
    }]);

    // Start without waiting a connection to server
    game.start();

    // Make connection to sockets and setup functions
    game.connectToServer({
        socket: 'ws://localhost:5611'
    });

    game.attachEvent('started', function(scene, camera) {
        // make camera as a flashlight
        var light = new PointLight({
            body: new Body({
                parent: camera.body
            })
        });
        scene.addLight(light);
    });
})();
