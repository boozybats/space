var wrap = {
    AFTERDEATH: 3000, // how much time object lives after death
    MAX_DESTROY_OVERWEIGHT: 4, // more bigger objecet will "eat" another (minimum this multiplier times)
    VISION_RANGE: 5, // visible objects for player range multiplier on diameter
    DESIGNATIONS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    MAP: map()
};

module.exports = wrap;

function map() {
    return [
        [{
                width: 10e+5,
                height: 10e+5,
                spawn: {
                    count: 10,
                    interval: 5000,
                    lifetime: 25000,
                    playerSize: [4e+5, 5e+5],
                    npcSize: [2e+4, 3e+4]
                }
            },
            {
                width: 10e+5,
                height: 10e+5,
                spawn: {
                    count: 3,
                    interval: 10000,
                    lifetime: 25000,
                    playerSize: [4e+5, 5e+5],
                    npcSize: [1.5e+5, 2e+5]
                }
            }
        ],
        [{
                width: 10e+5,
                height: 10e+5
            },
            {
                width: 10e+5,
                height: 10e+5,
                spawn: {
                    count: 6,
                    interval: 5000,
                    lifetime: 25000,
                    playerSize: [4e+5, 5e+5],
                    npcSize: [5e+4, 6e+4]
                }
            }
        ]
    ];
}