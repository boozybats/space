/* Some values which have 2 or more arrays have a logic like:
0 index - 1 lvl values, 1 - 2 lvl, e.t.c. */

var wrap = {
	LEVELS: 1,
	AREA_SIZES: [[20, 20]],
	PLAYER_SIZES: [[6, 8]], //[[4e+5, 5e+5]],
	NPC_SIZES: [[1, 2]],
    SPAWN_LIFETIME: 60000,
    SPAWN_INTERVAL: 5000,
    SPAWN_COUNT: 5
};

module.exports = wrap;
