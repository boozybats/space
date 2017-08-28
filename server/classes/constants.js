/* Some values which have 2 or more arrays have a logic like:
0 index - 1 lvl values, 1 - 2 lvl, e.t.c. */

var wrap = {
    LEVELS: 1,
    PLAYER_SIZES: [
        [6, 8],
        [60, 80]
    ], //[[4e+5, 5e+5]],
    NPC_SIZES: [
        [0.2, 0.3],
        [2, 4]
    ],
    SPAWN_LIFETIME: 60000,
    SPAWN_INTERVAL: 5000,
    SPAWN_COUNT: 5,
    AFTERDEATH: 3000,
    MAX_DESTROY_OVERWEIGHT: 4,
    VISION_RANGE: 5, // visible objects for player range multiplier on diameter
    DESIGNATIONS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    MAP: map()
};

module.exports = wrap;

function map() {
    var out = [
        [{
                width: 100,
                height: 100,
                isSpawn: true
            },
            {
                width: 500,
                height: 500
            }
        ],
        [{
                width: 500,
                height: 500
            },
            {
                width: 1e+3,
                height: 3e+3
            }
        ]
    ];
}