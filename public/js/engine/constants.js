// Auto-determined value by screen width
const RESOLUTION_WIDTH = screen.width;
// Auto-determined value by screen height
const RESOLUTION_HEIGHT = screen.height;
// Maximal screen square resolution
const RESOLUTION_MAX = Math.max(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
// Minimal screen square resolution
const RESOLUTION_MIN = Math.min(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

// Physical offset from deduction point, pseudo-origin
const DEFAULT_NEARFIELD = 0.9999;
/* Maximum far plan position where you can see a point,
doesn't brings a distortion on any value; needs only
for depth-buffer */
const DEFAULT_FARFIELD = 1e+20;
// How much degrees user see vertically (recommended value less than 55)
const DEFAULT_FOVY = 50;
/* Perspective matrix for projection matrix. Sets proportions of
screen and edits to required values */
const DEFAULT_PERSPECTIVE = Mat4.perspective(
    RESOLUTION_WIDTH / RESOLUTION_HEIGHT,
    DEFAULT_NEARFIELD,
    DEFAULT_FARFIELD,
    DEFAULT_FOVY
);
// Fraps per second
const DEFAULT_FPS = 1000 / 60;

// Contains default values for every available uniform-types
const DEFAULT_VALUES = {
    mat4: new Mat4,
    mat3: new Mat3,
    mat2: new Mat2,
    vec4: new Vec4,
    vec3: new Vec3,
    vec2: new Vec2,
    col: new Color(0, 0, 0, 0),
    qua: new Quaternion,
    eul: new Euler,
    tex: 0,
    num: 0
};

// Gravitational constant
const G = 6.6738480 * Math.pow(10, -11);
// How much layers must have matter
const LAYERS_COUNT = 1000;
// Constant for determining temperature (taken from Earth)
const PRESSURE_TEMPERATURE_CONST = 6669090909090;
// Minimal radius from which start calculations
const CORE_MIN_RADIUS = 25;
// Normal pressure for planets like Earth
const NORMAL_PRESSURE = 101325;
// Periodic table with all available elements in game
const PeriodicTable = {
    Fe: {
        M: 55.845,
        p: 7874,
        melting: 1812,
        boiling: 3135,
        color: new Color(235, 233, 232, 1)
    },
    Mg: {
        M: 24.305,
        p: 1738,
        melting: 924,
        boiling: 1363,
        color: new Color(130, 130, 120, 1)
    },
    Ni: {
        M: 58.6934,
        p: 8902,
        melting: 1726,
        boiling: 3005,
        color: new Color(222, 222, 222, 1)
    },
    O: {
        M: 15.999,
        p: 1141,
        melting: 54,
        boiling: 90,
        color: new Color(10, 110, 255, 0.1)
    },
    S: {
        M: 32.06,
        p: 2070,
        melting: 386,
        boiling: 717,
        color: new Color(225, 220, 125, 1)
    },
    Si: {
        M: 28.085,
        p: 2330,
        melting: 1683,
        boiling: 2623,
        color: new Color(90, 110, 150, 1)
    }
};
