function generateHeightMap(width, height, size) {
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
function perlinNoise(width, height, influence, size) {
	var scaleW = width/(size-1);
	var scaleH = height/(size-1);
	var perm = [];
	var gradient = [];
	perlinInitialize(perm, gradient, size);
	// console.log(perm,gradient);
	console.log(width,height,gradient.length,perm.length,size);
	for(var j = 0; j < height; j++){
		var y = j/scaleH;
		for (var i = 0; i < width ; i++){
			var x = i/scaleW;
			var corners = getCorner(x, y);
			// console.log(corners);

			//get the index of corners in the permu
			var c00 = size * corners.t + corners.l;
			var c01 = c00 + 1;
			var c10 = size * corners.b + corners.l;
			var c11 = c10 + 1;
			// console.log(c00,c01,c10,c11);
			
			//Computing vectors
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
			var wx = 3*Math.pow(tx0,2)-2*Math.pow(tx0,3);
			var wy = 3*Math.pow(ty0,2)-2*Math.pow(ty0,3);

			//compute the influence
			// Interpolate between grid point gradients
			ix0 = lerp(p00, p10, wx);
			iy0 = lerp(p01, p11, wx);
			var t = lerp(ix0,iy0, wy);
			influence.push(Math.abs(t));
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
function perlinInitialize(perm, gradient, size) {
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
		var r = Math.floor(Math.random()*size*size);
		k = perm[r];
		perm[r] = perm[i];
		perm[i] = perm[r];
	}
}


function getCorner(x, y) {
	var l = Math.floor(x);
	var r = l + 1;
	var t = Math.floor(y);
	var b = t + 1;

	return {"r":r,"l":l,"b":b,"t":t};
}	


function lerp(i0, i1, w) {
	return i0 * (1-w) + i1 * w;
}