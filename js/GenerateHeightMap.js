/**
 * This class includes functions to generate height map data, 
 * which will be used as height of the terrain.
 * reference: https://en.wikipedia.org/wiki/Perlin_noise
 * reference: http://flafla2.github.io/2014/08/09/perlinnoise.html
 * reference: Texturing and Modeling: Chapter7 Procedural modeling of gases
 */
  
/* Generate perlin noise for the heightmap
 * @param      {num}    width   The width of the rendering area.
 * @param      {num}    height  The height of the rendering area.
 * @param      {num}    size    The size of the tile.
 * @return     {array}  one array save the height data for all pixels
 */

function generateHeightMap(width, height, size) {
		var influence = perlinNoise(width, height, size);
		return influence;
}

/* Generate simplex noise for the heightmap according to the time
 * @param      {num}    width      The width of the rendering area.
 * @param      {num}    height     The height of the rendering area.
 * @param      {num}    interval   The time interval.
 * @param      {num}    size       The size of the tile.
 * @param      {num}    t    	   The real-time time. 
 * @return     {array}  one array save the height data for all pixels
 */
function generateTimeHeightMap(width, height, interval, size, t) {
		var influence = [];
		var z = t*size/interval;
		perlinNoise3D(width, height, influence, z);
		return influence;
}
/**
 * helper function to generate perlinNoise
 *
 * @param      {int}  width      The width
 * @param      {int}  height     The height
 * @param      {array}  influence  The returned value
 */
function perlinNoise(width, height, size) {
	var scaleW = width/(size-1);
	var scaleH = height/(size-1);
	var perm = [];
	var gradient = [];
	var influence = [];
	perlinInitialize(perm, gradient, size);

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
			// 
			ix0 = lerp(p00, p01, wx);
			iy0 = lerp(p10, p11, wx);
			var t = lerp(ix0,iy0, wy);
			influence.push(Math.abs(t));
		}
	}
	return influence;

}


/**
 * helper function to generate simplex noise
 */
function perlinNoise3D(width,height,interval,influence,z){
	var scaleW = width/size;
	var scaleH = height/size;
	var scaleT = interval/size;
	perm = [];
	gardient = 
	[[1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
	 [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
	 [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1],
	 [1,1,0], [0,-1,1], [-1,1,0], [0,-1,-1]];
	perlin3DInitialize(perm, size);

	var F3 = 1.0/3.0;
	var G3 = 1.0/6.0;

	var z = time/scaleT;
	for(var b = 0; b < height; b++){
		var y = b/scaleH;
		for(var a = 0; a < width; a++){
			var x = a/scaleW;
		
		 	var s = (x+y+z)*F3; 
			var i = fastfloor(x+s);
			var j = fastfloor(y+s);
			var k = fastfloor(z+s);

			var t = (x+y+z)*G3;
			var x0 = i-t;
			var y0 = j-t;
			var z0 = k-t;

			var dx = x - x0;
			var dy = y - y0;
			var dz = z - z0;

			//offset
			var i1, j1, k1;
			var i2, j2, k2;

			if(dx>=dy && dy>=dz){i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;}
			else if(dx>=dz && dz>=dy){i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;}
			else if(dz>=dx && dx>=dy){i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;}
			else if(dz>=dy && dy>=dx){i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;}
			else if(dy>=dz && dz>=dx){i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;}
			else if(dy>=dx && dx>=dy){i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;}

		 
			// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
			// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
			// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
			// c = 1/6.
			var x1 = dx - i1 + G3; 
			var y1 = dy - j1 + G3;
			var z1 = dz - k1 + G3;
			var x2 = dx - i2 + 2.0*G3; 
			var y2 = dy - j2 + 2.0*G3;
			var z2 = dz - k2 + 2.0*G3;
			var x3 = dx - 1.0 + 3.0*G3; 
			var y3 = dy - 1.0 + 3.0*G3;
			var z3 = dz - 1.0 + 3.0*G3;
			 
			//get index for the four corners
			var gi0 = perm[i+perm[j+perm[k]]] % 12;
			var gi1 = perm[i+i1+perm[j+j1+perm[k+k1]]] % 12;
			var gi2 = perm[i+i2+perm[j+j2+perm[k+k2]]] % 12;
			var gi3 = perm[i+1+perm[j+1+perm[k+1]]] % 12;
			
			// Calculate the weight of each corner	
			var n0, n1, n2, n3;
			var t0 = 0.5 - dx*dx - dy*dy - dz*dz;
			var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
			var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
			var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;

			if(t0<0) n0 = 0.0;
			else{
				n0 = Math.pow(t0,4)*(gardient[gi0][0]*dx+gardient[gi0][1]*dy+gardient[gi0][2]*dz);
			}
			if(t1<0) n1 = 0.0;
			else{
				n1 = Math.pow(t1,4)*(gardient[gi1][0]*x1+gardient[gi1][1]*y1+gardient[gi1][2]*z1);
			}
			if(t2<0) n2 = 0.0;
			else {
			 	n2 = Math.pow(t2,4)*(gardient[gi2][0]*x2+gardient[gi2][1]*y2+gardient[gi2][2]*z2);
			}
			if(t3<0) n3 = 0.0;
			else {
				n3 = Math.pow(t3,4) * (gardient[gi3][0]*x3+gardient[gi3][1]*y3+gardient[gi3][2]*z3);
			}
			// Add contributions from each corner to get the final noise value.
			// The result is scaled to stay just inside [-1,1]
			influence.push[32.0*(n0 + n1 + n2 + n3)];
		}
	}

}

/**
 * function to initialize the perm and gradient array for 2D perlin noise
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

/**
 * function to initialize the perm and gradient array for 3D perlin noise
 */
function perlin3DInitialize(perm, gradient, size){
	for(var i = 0; i < size ; i++){
		perm.push(i);
	}

	for(var i = 0; i < size ; i++){
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

function fastfloor(t){
	return Math.floor(t);
}

function lerp(i0, i1, w) {
	return i0 * (1-w) + i1 * w;
}