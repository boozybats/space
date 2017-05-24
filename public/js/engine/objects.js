// counterclockwise indices

/**
 * Creates item with icosahedron's mesh
 * @this {Icosahedron}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @param {Rigidbody} options.rigidbody
 * @class
 * @extends Item
 */
function Icosahedron(options = {}) {
    if (typeof options !== 'object') {
        warn('Icosahedron', 'options', options);
    }

    var icos = icosahedronMesh;
    options.mesh = new Mesh({
        attributes: {
            a_Position: icos.vertices,
            a_Normal: icos.normals,
            a_UV: icos.uvs,
            a_Tangent: icos.tangents,
            a_Bitangent: icos.bitangents
        },
        vertexIndices: icos.indices
    });

    Item.apply(this, options);
}

Icosahedron.prototype = Object.create(Item.prototype);
Icosahedron.prototype.constructor = Icosahedron;

/**
 * Creates icosahedron in sphere with R = 1.
 * @return {Object}
 * @method
 * @static
 * @example
 * var mesh = Icosahedron.mesh();
 * mesh;  // {vertices, indices, normals, uvs, tangents, bitangents}
 */
Icosahedron.mesh = function() {
    // 20 sides, 30 edges, 12 vertices (in the original figure)

    // size in engine units for x and y coordinates
    var size = 2;
    // distance between central and additional levels
    var smadis = 1 / 4 * size;
    // distance between first and second levels
    var bigdis = 2 / 4 * size;
    // vertices count in one edge (level)
    var count = 5;
    // distance between vertices on edge (x-level) (in radians, 2*PI = 360 degrees)
    var angdis = 2 * Math.PI / count;
    // second edge have x-offset relative to first level (half of distance between vertices)
    var offset = angdis / 2;
    /* begin point in radians where must be started first vertex. Set to PI
    to simplify work with uvs (vertex corresponds to begin point in uvs [0, 0]) */
    var begpoi = -Math.PI;
    // texture copactiy: how much vertices contains one texture
    var texcop = 5.5;
    // texture distance between two vertices ("count / textcop" - occupied space).
    // count / textcop / count = 1 / textcop
    var texdis = 1 / texcop;

    /* Best way to generate indices - hardcore them, no problems
    with face culling */
    var indices = [
        0, 1, 3, 2, 3, 5, 4, 5, 7, 6, 7, 9, 8, 9, 10,
        11, 14, 12, 13, 16, 14, 15, 18, 16, 17, 20, 18, 19, 21, 20,
        14, 3, 12, 16, 5, 14, 18, 7, 16, 20, 9, 18, 21, 10, 20,
        1, 12, 3, 3, 14, 5, 5, 16, 7, 7, 18, 9, 9, 20, 10
    ];

    var vertices = [];
    vertices.size = 3;
    var normals = [];
    normals.size = 3;
    var uvs = [];
    uvs.size = 2;

    // top and bottom central vertices
    var top = [0, -1, 0],
        bot = [0, 1, 0];

    // Make all the vertices and connect them with centers
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 5; j++) {
            generateCenter(j, i);
            generateVertex(j, i);
        }
        generateVertex(0, i, 1);
    }

    var out = {
        vertices: vertices,
        indices: indices,
        normals: normals,
        uvs: uvs
    };

    var tbn = TBN(out);

    var tg = tbn.tangents;
    tg.size = 3;

    var btg = tbn.bitangents;
    btg.size = 3;

    out.tangents = tg;
    out.bitangents = btg;

    return out;

    /**
     * Genearets central vertex by index and level, pushes values in arrays
     * @param  {Number} index 0-4 index number of vertex on edge
     * @param  {Number} lvl   0-1 height level of edge (only 2 levels)
     * @method
     * @private
     */
    function generateCenter(index, lvl) {
        // define central vertex by level, for first - top vertex, for second - bottom
        var central = lvl == 0 ? top : bot;
        vertices.push(central[0], central[1], central[2]);
        normals.push(central[0], central[1], central[2]);

        // for first level add offset as half of vertice length, for second full length
        var offsetx = (lvl + 1) * 0.5 * texdis;
        uvs.push(offsetx + index * texdis, lvl);
    }

    /**
     * Generates vertex on edge by index and level, pushes values in arrays
     * @param  {Number} index 0-4 index number of vertex on edge
     * @param  {Number} lvl   0-1 height level of edge (only 2 levels)
     * @param {Number} uvoffset Adds offset to uv (needs to last vertex,
     * so texture will not be corrupted on uv-map)
     * @method
     * @private
     */
    function generateVertex(index, lvl, uvoffset = 0) {
        // vertices values must be between -1 and 1
        /* edges start y-position is small distance from center and
        big position if level is second, subtract 1 to make interval
        [-1, 1] from [0, 2] */
        var y = smadis + lvl * bigdis - 1;

        /* begin point - where starts first vertex, index order * angle distance -
        current vertex position on edge, level * offset - offset for second level */
        var angle = begpoi + index * angdis + lvl * offset;

        // x value is cos, z is sin
        var x = Math.cos(angle),
            z = Math.sin(angle);

        var vec = new Vec3(x, y, z);
        var normal = vec.normalize();

        /* align point to sphere coordinates system (with radius = 1):
        subtract vector length from sphere radius and add error to current
        vector */
        var dis = 1 - vec.length();
        vec = amc('+', vec, amc('*', normal, dis));

        vertices.push(vec.x, vec.y, vec.z);
        normals.push(normal.x, normal.y, normal.z);

        var uv = [
            uvoffset + 0.5 + Math.atan2(vec.z, vec.x) / (2 * Math.PI),
            0.5 + Math.asin(vec.y) / Math.PI
        ];
        uvs.push(uv[0], uv[1]);
    }
}

var icosahedronMesh = Icosahedron.mesh();

/**
 * Creates item with mesh of sphere by icosahedron mesh. This
 * is the one of the best ways to make sphere's mesh
 * @this {Sphere}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @param {Number} options.precision How much times sphere must be
 * updated by upgrade system, must be between 0 and 4
 * @class
 * @extends Item
 */
function Sphere(options = {}) {
    if (typeof options !== 'object') {
        warn('Sphere', 'options', options);
    }

    var sphere = sphereMesh[options.precision];
    if (!sphere) {
        sphere = sphereMesh[0];
    }

    options.mesh = new Mesh({
        attributes: {
            a_Position: sphere.vertices,
            a_Normal: sphere.normals,
            a_UV: sphere.uvs,
            a_Tangent: sphere.tangents,
            a_Bitangent: sphere.bitangents
        },
        vertexIndices: sphere.indices
    });

    Item.apply(this, options);
}

Sphere.prototype = Object.create(Item.prototype);
Sphere.prototype.constructor = Sphere;

/**
 * Adds 4 new faces for each face of spher's mesh.
 * @return {Object}
 * @param {Array} vertices
 * @param {Array} normals
 * @param {Array} uvs
 * @param {Array} indices
 * @example
 * var mesh = Sphere.mesh();
 * mesh;  // {vertices, indices, normals, uvs, tangents, bitangents}
 */
Sphere.mesh = function(options = {}) {
    var vertices = options.vertices,
        normals = options.normals,
        uvs = options.uvs,
        indices = options.indices;

    if (!(vertices instanceof Array)) {
        warn('Sphere->mesh', 'options.vertices', vertices);
        return options;
    } else if (!(normals instanceof Array)) {
        warn('Sphere->mesh', 'options.normals', normals);
        return options;
    } else if (!(uvs instanceof Array)) {
        warn('Sphere->mesh', 'options.uvs', uvs);
        return options;
    } else if (!(indices instanceof Array)) {
        warn('Sphere->mesh', 'options.indices', indices);
        return options;
    }

    // transforms older sphere to more detailed sphere
    var nvertices = vertices.slice(),
        nnormals = normals.slice(),
        nuvs = uvs.slice(),
        nindices = indices.slice();

    nvertices.size = 3;
    nnormals.size = 3;
    nuvs.size = 2;

    // break all triangles on 4 triangles
    for (var i = 0; i < indices.length; i += 3) {
        // define 3 indices to make a face
        var i0 = indices[i],
            i1 = indices[i + 1],
            i2 = indices[i + 2];

        // transform vertices to vectors
        var v0 = new Vec3(
            vertices[i0 * 3],
            vertices[i0 * 3 + 1],
            vertices[i0 * 3 + 2]
        );
        var v1 = new Vec3(
            vertices[i1 * 3],
            vertices[i1 * 3 + 1],
            vertices[i1 * 3 + 2]
        );
        var v2 = new Vec3(
            vertices[i2 * 3],
            vertices[i2 * 3 + 1],
            vertices[i2 * 3 + 2]
        );

        // transform uvs to vectors
        var uv0 = new Vec2(
            uvs[i0 * 2],
            uvs[i0 * 2 + 1]
        );
        var uv1 = new Vec2(
            uvs[i1 * 2],
            uvs[i1 * 2 + 1]
        );
        var uv2 = new Vec2(
            uvs[i2 * 2],
            uvs[i2 * 2 + 1]
        );

        // define middlepoints of triangle's edges
        var a = Vec.avg(v0, v1),
            b = Vec.avg(v1, v2),
            c = Vec.avg(v2, v0);

        // how much distance need to full radius (R = 1)
        var ad = 1 - a.length(),
            bd = 1 - b.length(),
            cd = 1 - c.length();

        // normalization to recovery radius
        var an = a.normalize(),
            bn = b.normalize(),
            cn = c.normalize();

        // make right point for radius "R = 1"
        a = amc('+', a, amc('*', an, ad));
        b = amc('+', b, amc('*', bn, bd));
        c = amc('+', c, amc('*', cn, cd));

        var uv = [];
        for (var j = 0; j < 3; j++) {
            var x, y, z;

            switch (j) {
                case 0:
                    x = a.x,
                        y = a.y,
                        z = a.z;
                    break;

                case 1:
                    x = b.x,
                        y = b.y,
                        z = b.z;
                    break;

                case 2:
                    x = c.x,
                        y = c.y,
                        z = c.z;
                    break;
            }

            var arr = [
                0.5 + Math.atan2(z, x) / (2 * Math.PI),
                0.5 + Math.asin(y) / Math.PI
            ];

            // if coordinates repeat than add 1 to x coordinate
            if ((uv0.x >= 1 || uv1.x >= 1 || uv2.x >= 1) && (arr[0] >= 0 && arr[0] < 0.5)) {
                arr[0] += 1;
            }

            uv.push(arr[0], arr[1]);
        }

        var length = nvertices.length / 3;
        nvertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        nnormals.push(an.x, an.y, an.z, bn.x, bn.y, bn.z, cn.x, cn.y, cn.z);
        nuvs.push(uv[0], uv[1]);

        a = length;
        b = length + 1;
        c = length + 2;

        // connection with all triangles
        nindices.splice(i * 4, 3,
            i0, a, c,
            a, i1, b,
            c, b, i2,
            a, b, c
        );
    }

    var out = {
        vertices: nvertices,
        normals: nnormals,
        indices: nindices,
        uvs: nuvs
    };

    // Make TBN vectors for sphere
    var tbn = TBN(out);

    var tg = tbn.tangents;
    tg.size = 3;

    var btg = tbn.bitangents;
    btg.size = 3;

    out.tangents = tg;
    out.bitangents = btg;

    return out;
}

/***
 * Makes sphere's mesh, it's array with 5 position,
 * every position is precision of sphere
 */
var sphereMesh;

;
(function() {
    sphereMesh = [];
    sphereMesh[0] = icosahedronMesh;
    for (var i = 1; i < 5; i++) {
        sphereMesh[i] = Sphere.mesh(sphereMesh[i - 1]);
    }
})();

/**
 * Creates item with cube's mesh.
 * @this {Cube}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String}options. name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @class
 * @extends Item
 */
function Cube(optins = {}) {
    if (typeof options !== 'object') {
        warn('Cube', 'options', options);
    }

    var cube = cubeMesh;
    options.mesh = new Mesh({
        attributes: {
            a_Position: cube.vertices,
            a_UV: cube.uvs,
            a_Normal: cube.normals,
            a_Tangent: cube.tangents,
            a_Bitangent: cube.bitangents
        },
        vertexIndices: cube.indices
    });

    Item.apply(this, options);
}

Cube.prototype = Object.create(Item.prototype);
Cube.prototype.constructor = Cube;

Cube.mesh = function() {
    var indices = [
        0, 1, 3, 3, 1, 2,
        7, 6, 4, 4, 6, 5,
        11, 10, 8, 8, 10, 9,
        12, 13, 15, 15, 13, 14,
        17, 16, 18, 18, 16, 19,
        20, 21, 23, 23, 21, 22
    ];

    var vertices = [-1, -1, 1, -1, 1, 1,
        1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1,
        1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
        1, -1, 1, 1, 1, 1,
        1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -1, -1,
        1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1,
        1, 1, -1, 1, 1, 1
    ];
    vertices.size = 3;

    var uvs = [
        0, 0, 0, 1, 1, 1, 1, 0,
        1, 0, 1, 1, 0, 1, 0, 0,
        1, 0, 1, 1, 0, 1, 0, 0,
        0, 0, 0, 1, 1, 1, 1, 0,
        0, 1, 0, 0, 1, 0, 1, 1,
        0, 0, 0, 1, 1, 1, 1, 0
    ];
    uvs.size = 2;

    var tbn = TBN({
        indices: indices,
        vertices: vertices,
        uvs: uvs
    });

    var normals = tbn.normals;
    normals.size = 3;

    var tangents = tbn.tangents;
    tangents.size = 3;

    var bitangents = tbn.bitangents;
    bitangents.size = 3;

    return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        uvs: uvs,
        tangents: tangents,
        bitangents: bitangents
    };
}

var cubeMesh = Cube.mesh();

/**
 * Creates item with quad's mesh.
 * @this {UI}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @param {Number} options.width
 * @param {Number} options.height
 * @class
 * @property {Vec2} position Defines position
 * in the project space by screen position.
 * @extends Item
 */
function UI(options = {}) {
    if (typeof options !== 'object') {
        warn('UI', 'options', options);
    }

    Item.apply(this, options);

    this.width = options.width || RESOLUTION_WIDTH;
    this.height = options.height || RESOLUTION_HEIGHT;
    this.position = new Vec3;

    this.initializeMesh();
}

UI.prototype = Object.create(Item.prototype);
UI.prototype.constructor = UI;

Object.defineProperties(UI.prototype, {
    height: {
        get: function() {
            return this.height_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('UI#height', 'val', val);
                val = 0;
            }

            this.height_ = val;
            this.scale();
        }
    },
    position: {
        get: function() {
            return this.position_;
        },
        set: function(val) {
            if (!(val instanceof Vec)) {
                warn('UI#position', 'val', val);
                val = 0;
            }

            var x = (val.x) / RESOLUTION_WIDTH * 2 - 1;
            var y = -(val.y) / RESOLUTION_HEIGHT * 2 + 1;

            this.body.position = new Vec3(x, y, 0);
            this.position_ = val;
        }
    },
    width: {
        get: function() {
            return this.width_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('UI#width', 'val', val);
                val = 0;
            }

            this.width_ = val;
            this.scale();
        }
    }
});

UI.prototype.initializeMesh = function() {
    var vertices = [-1, -1, 0, -1, 1, 0,
        1, 1, 0, 1, -1, 0
    ];
    vertices.size = 3;

    var uv = [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ];
    uv.size = 2;

    var indices = [0, 1, 2, 2, 3, 0];

    this.mesh = new Mesh({
        attributes: {
            a_Position: vertices,
            a_UV: uv
        },
        vertexIndices: indices
    });
}

UI.prototype.scale = function() {
    this.body.scale = new Vec3(
        1 * ((this.width || 0) / RESOLUTION_WIDTH),
        1 * ((this.height || 0) / RESOLUTION_HEIGHT),
        1
    );
}

/**
 * An empty item
 * @this{Empty}
 * @class
 */
function Empty(options = {}) {
    Item.apply(this, options);
}

Empty.prototype = Object.create(Item.prototype);
Empty.prototype.constructor = Empty;

/**
 * Generates tangents and bitangents and normals for mesh.
 * @param {Array} indices
 * @param {Array} vertices
 * @param {Array} uvs
 * @param {Array} normals
 * @return {Object}
 * @example
 * TBN(Icosahedron.mesh());  // {indices, vertices, uvs, normals, tangents, bitangents}
 */
function TBN(options = {}) {
    var indices = options.indices,
        vertices = options.vertices,
        uvs = options.uvs,
        normals = options.normals;

    if (!indices) {
        warn('TBN', 'indices', indices);
    }
    if (!vertices) {
        warn('TBN', 'vertices', vertices);
    }

    var out = {};

    if (!normals) {
        normals = [];
        var memory = [];

        for (var i = 0; i < indices.length; i += 3) {
            var ind0 = indices[i],
                ind1 = indices[i + 1],
                ind2 = indices[i + 2];

            var v0 = new Vec3(vertices[ind0 * 3], vertices[ind0 * 3 + 1], vertices[ind0 * 3 + 2]),
                v1 = new Vec3(vertices[ind1 * 3], vertices[ind1 * 3 + 1], vertices[ind1 * 3 + 2]),
                v2 = new Vec3(vertices[ind2 * 3], vertices[ind2 * 3 + 1], vertices[ind2 * 3 + 2]);

            var vec0 = new Vec3(
                v0.x - v1.x,
                v0.y - v1.y,
                v0.z - v1.z
            );
            var vec1 = new Vec3(
                v1.x - v2.x,
                v1.y - v2.y,
                v1.z - v2.z
            );

            var N = Vec3.cross(vec0, vec1).normalize();

            if (memory[ind0]) {
                memory[ind0].push(N);
            } else {
                memory[ind0] = [N];
            }
            if (memory[ind1]) {
                memory[ind1].push(N);
            } else {
                memory[ind1] = [N];
            }
            if (memory[ind2]) {
                memory[ind2].push(N);
            } else {
                memory[ind2] = [N];
            }
        }

        for (var i = 0; i < vertices.length / 3; i++) {
            var normal = Vec.avg.apply(Vec, memory[i]);
            normals.push(normal.x, normal.y, normal.z);
        }

        out.normals = normals;
    }

    if (uvs) {
        out.tangents = [];
        out.bitangents = [];

        var tangents = [],
            bitangents = [];

        for (var i = 0; i < indices.length; i += 3) {
            var ind0 = indices[i + 2],
                ind1 = indices[i + 1],
                ind2 = indices[i];

            var v0 = new Vec3(vertices[ind0 * 3], vertices[ind0 * 3 + 1], vertices[ind0 * 3 + 2]),
                v1 = new Vec3(vertices[ind1 * 3], vertices[ind1 * 3 + 1], vertices[ind1 * 3 + 2]),
                v2 = new Vec3(vertices[ind2 * 3], vertices[ind2 * 3 + 1], vertices[ind2 * 3 + 2]);
            var s0 = uvs[ind0 * 2],
                t0 = uvs[ind0 * 2 + 1],
                s1 = uvs[ind1 * 2],
                t1 = uvs[ind1 * 2 + 1],
                s2 = uvs[ind2 * 2],
                t2 = uvs[ind2 * 2 + 1];

            var tb = calcBasis(v0, v1, v2, s0, t0, s1, t1, s2, t2);

            if (tangents[ind0]) {
                tangents[ind0].push(tb.tangent);
                bitangents[ind0].push(tb.bitangent);
            } else {
                tangents[ind0] = [tb.tangent];
                bitangents[ind0] = [tb.bitangent];
            }

            if (tangents[ind1]) {
                tangents[ind1].push(tb.tangent);
                bitangents[ind1].push(tb.bitangent);
            } else {
                tangents[ind1] = [tb.tangent];
                bitangents[ind1] = [tb.bitangent];
            }

            if (tangents[ind2]) {
                tangents[ind2].push(tb.tangent);
                bitangents[ind2].push(tb.bitangent);
            } else {
                tangents[ind2] = [tb.tangent];
                bitangents[ind2] = [tb.bitangent];
            }
        }

        for (var i = 0; i < vertices.length / 3; i++) {
            var tg = tangents[i];
            var btg = bitangents[i];

            tr = Vec.avg.apply(Vec, tg);
            br = Vec.avg.apply(Vec, btg);

            var normal = new Vec3(
                normals[i * 3],
                normals[i * 3 + 1],
                normals[i * 3 + 2]
            );

            tr = ortogonalize(normal, tr);
            br = ortogonalize(normal, br);

            out.tangents.push(tr.x, tr.y, tr.z);
            out.bitangents.push(br.x, br.y, br.z);
        }
    }

    return out;

    function calcBasis(E, F, G, sE, tE, sF, tF, sG, tG) {
        var P = amc('-', F, E),
            Q = amc('-', G, E);
        var s0 = sF - sE,
            t0 = tF - tE,
            s1 = sG - sE,
            t1 = tG - tE;

        var pqMatrix = new Mat(2, 3, [
            P.x, P.y, P.z,
            Q.x, Q.y, Q.z
        ]);

        var temp = 1 / (s0 * t1 - s1 * t0);

        var stMatrix = new Mat(2, 2, [
            t1 * temp, -t0 * temp, -s1 * temp, s0 * temp
        ]);

        var tbMatrix = amc('*', stMatrix, pqMatrix);

        var t = new Vec3(tbMatrix[0][0], tbMatrix[0][1], tbMatrix[0][2]).normalize(),
            b = new Vec3(tbMatrix[1][0], tbMatrix[1][1], tbMatrix[1][2]).normalize();

        var out = {
            tangent: t,
            bitangent: b
        };

        return out;
    }

    function ortogonalize(v0, v1) {
        var proj = getpoint(v0, amc('*', v0, -1), v1);
        var res = amc('-', v1, proj);
        res.normalize();

        return res;
    }

    function getpoint(a, b, p) {
        var c = amc('-', p, a),
            V = amc('-', b, a);

        var d = V.length();
        V = V.normalize();

        var t = Vec.dot(V, c);

        if (t < 0) {
            return a;
        } else if (t > d) {
            return b;
        }

        V = amc('*', V, t);
        var out = amc('+', a, V);

        return out;
    }
}
