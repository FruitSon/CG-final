var hMoveSpeed = 10;
var wMoveSpeed = 10;
var worldWidth = 256;
var worldHeight = 256;

function Terrain(scene) {
	var that = {};

	/**
	 * Update the data per pixel in real time
	 * @param  {Array | function} tile  
	 * @param {int} dimension the number of values per pixel 
	 * an flatten array, whose size is width*height*dimension
	 * or a function that can generate an flatten array
	 * @param  {int} uwidth  the width of the tile
	 * @param  {int} uheight the height of the tile
	 * @param  {int} width   the width of the canvas
	 * @param  {int} height  the height of the canvas
	 * @param  {int} t       the current time stamp
	 * @return {Array}         an flatten array
	 */
	var updateData = that.updateData = function(tile, dimension, uwidth, uheight, width, height, t) {
		var result = new Array();
		var startWidth = (hMoveSpeed * t) % uwidth;
		if (startWidth > 0) {
			startWidth -= uwidth;
		}
		var startHeight = (hMoveSpeed * t) % uheight;
		if (startHeight > 0) {
			startHeight -= uheight;
		}

		for (var w = startWidth; w < width; w += uwidth) {
			for (var h = startHeight; h < height; h += uheight) {
				var units;
				if (typeof tile === 'function') {
					units = tile();
				} else {
					units = tile;
				}
				for (var i = 0; i < uwidth; i ++) {
					for (var j = 0; j < uheight; j ++) {
						var x = w + i;
						var y = h + j;
						if (x >= width || x < 0 || y >= height || y < 0) {
							continue;
						}

						for (var k = 0; k < dimension; k ++) {
							result[(y * width + x) * dimension + k] = units[(j * uwidth + i) * dimension + k];
						}
					}
				}
			}
		}

		return result;
	};

	var generateHeightMap = function(width, height, size) {
		var influence = [];
		perlinNoise(width, height, influence, size);
		return influence;
	}

	/**
	 * function to generate perlinNoise
	 *
	 * @param      {int}  width      The width
	 * @param      {int}  height     The height
	 * @param      {array}  influence  The returned value
	 */
	var perlinNoise = function(width, height, influence, size) {
		var scaleW = width/size;
		var scaleH = height/size;
		var perm = [];
		var gradient = [];
		perlinInitialize(perm, gradient, size);

		for (var i = 0; i < width ; i++){
			var x = i/scaleW;
			var u = fade(x);
			for(var j = 0; j < height; j++){
				var y = j/scaleH;
				var v = fade(y);
				var corners = getCorner(x, y);
				// console.log(corners);

				//get the index of corners in the permu
				var c00 = size * corners.t + corners.l;
				var c01 = c00 + 1;
				var c10 = size * corners.b + corners.l;
				var c11 = c10 + 1;
				// console.log(c00,c01,c10,c11);
				
				//Computing current gradient
				var tx0 = x - Math.floor(x);
				var tx1 = tx0 - 1;
				var ty0 = y - Math.floor(y);
				var ty1 = ty0 - 1;
				// console.log(tx0,tx1,ty0,ty1);

				//dot product of gradient and vector
				var p00 = gradient[c00][0]*tx0 + gradient[c00][1]*ty0;
				var p01 = gradient[c01][0]*tx1 + gradient[c01][1]*ty0;

				var p10 = gradient[c10][0]*tx0 + gradient[c10][1]*ty1;
				var p11 = gradient[c11][0]*tx1 + gradient[c11][1]*ty1;
				// console.log(p00,p01,p10,p11);

				//interpolation weight
				var wx = x - tx0;
				var wy = y - ty0;

				//compute the influence
				// Interpolate between grid point gradients
				ix0 = lerp(p00, p10, wx);
				iy0 = lerp(p01, p11, wx);
				var t = lerp(ix0,iy0, wy);
				influence.push(t);
			}
		}

	}

	/**
	 * { A function to initialize the perm and gradient array }
	 *
	 * @param      {Array}   perm      The permission
	 * @param      {Array}   gradient  The gradient
	 * @param      {number}  size      The number of points on each edge
	 */
	var perlinInitialize = function(perm, gradient, size) {
		//initialize permutation
		//generate gradient
		for(var i = 0; i < size * size; i++){
			perm.push(i);
			var x = Math.random()*2-1;
			var y = Math.random()*2-1;
			var temp = [x,y];
			gradient.push(temp);
		}

		for(var i = 0; i < size; i++){
			var r = Math.floor(Math.random()*256);
			k = perm[r];
			perm[r] = perm[i];
			perm[i] = perm[r];
		}
	}


	var getCorner = function(x, y) {
		var l = x<1?0:(Math.floor(x)-1);
		var r = l + 1;
		var t = y<1?0:(Math.floor(y)-1);
		var b = t + 1;

		return {"r":r,"l":l,"b":b,"t":t};
	}	

	/**
	 * fade function. 6t5-15t4+10t3
	 *
	 * @param      {int}  i       { parameter_description }
	 */
	var fade = function(i) {
		return 6*Math.pow(i,5)-15*Math.pow(i,4)+10*Math.pow(i,3);
	}

	var lerp = function(i0, i1, w) {
		return i0 * (1-w) + i1 * w;
	}

	var mesh;

	var init = function() {
		// data = generateHeight( worldWidth, worldHeight );

		var geometry = new THREE.PlaneBufferGeometry(7500, 7500, worldWidth - 1, worldHeight - 1);
		geometry.rotateX( - Math.PI / 2 );
		var vertices = geometry.attributes.position.array;

		var heights = generateHeightMap(worldWidth, worldHeight, 16);

		for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
			vertices[j + 1] = heights[i] * 5;
		}

		// texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldHeight ) );
		// texture.wrapS = THREE.ClampToEdgeWrapping;
		// texture.wrapT = THREE.ClampToEdgeWrapping;
		// mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		
		mesh = new THREE.Mesh(geometry);
		scene.add( mesh );
		return that;
	}

	return init();
}