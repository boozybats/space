;
(function() {
    // Make game and initialize it by custom options
    var game = new Game;
    game.initialize({
        canvas: {
            dom: document.body
        },
        graphic: {
            antialias: 'NOAA'
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
        socket: ['ws://localhost:5611', 'ws://192.168.1.182:5611', 'ws://192.168.1.9:5611']
    });
})();