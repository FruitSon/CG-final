var hMoveSpeed = 1;
var wMoveSpeed = 0;
var worldWidth = 256;
var worldHeight = 256;
var resolution = 16;
var light,helper,material;

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
	// var updateData = that.updateData = function(tile, dimension, uwidth, uheight, width, height, t) {
	// 	var result = new Array();
	// 	var startWidth = (hMoveSpeed * t) % uwidth;
	// 	if (startWidth > 0) {
	// 		startWidth -= uwidth;
	// 	}
	// 	var startHeight = (hMoveSpeed * t) % uheight;
	// 	if (startHeight > 0) {
	// 		startHeight -= uheight;
	// 	}

	// 	for (var w = startWidth; w < width; w += uwidth) {
	// 		for (var h = startHeight; h < height; h += uheight) {
	// 			var units;
	// 			if (typeof tile === 'function') {
	// 				units = tile();
	// 			} else {
	// 				units = tile;
	// 			}
	// 			for (var i = 0; i < uwidth; i ++) {
	// 				for (var j = 0; j < uheight; j ++) {
	// 					var x = w + i;
	// 					var y = h + j;
	// 					if (x >= width || x < 0 || y >= height || y < 0) {
	// 						continue;
	// 					}

	// 					for (var k = 0; k < dimension; k ++) {
	// 						result[(y * width + x) * dimension + k] = units[(j * uwidth + i) * dimension + k];
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return result;
	// };
	
	var updateData = that.updateData = function() {
		t ++;
		var vertices = geometry.attributes.position.array;

		for (var i = 0; i < worldWidth - wMoveSpeed; i ++) {
			for (var j = 0; j < worldHeight - hMoveSpeed; j ++) {
				heights[j * worldWidth + i] = heights[(j + hMoveSpeed) * worldWidth + i + wMoveSpeed];
				vertices[3 * (j * worldWidth + i) + 1] =
				vertices[3 * ((j + hMoveSpeed) * worldWidth + i + wMoveSpeed) + 1];
			}
		}

		for (var i = 0; i < worldWidth; i ++) {
			for (var j = worldHeight - hMoveSpeed; j < worldHeight; j ++) {
				heights[j * worldWidth + i] = generateHeightAtPoint(i, j, t);
				vertices[3 * (j * worldWidth + i) + 1] = heights[j * worldWidth + i] * 10;
			}
		}

		for (var i = worldWidth - wMoveSpeed; i < worldWidth; i ++) {
			for (var j = 0; j < worldHeight - hMoveSpeed; j ++) {
				heights[j * worldWidth + i] = generateHeightAtPoint(i, j, t);
				vertices[3 * (j * worldWidth + i) + 1] = heights[j * worldWidth + i] * 10;
			}
		}

		geometry.attributes.position.needsUpdate = true;
		
		texture = new THREE.CanvasTexture( generateTexture( heights, worldWidth, worldHeight ) );
		mesh.material.map = texture;
		texture.needsUpdate = true;
	};

	var mesh, geometry, texture;

	var z = Math.random() * 100, perlin = new ImprovedNoise(), t = 0;

	var generateHeight = function(width, height) {
		var size = width * height, data = new Uint8Array( size );
		for ( var i = 0; i < size; i ++ ) {
			var x = i % width, y = ~~ ( i / width );
			data[ i ] = generateHeightAtPoint(x, y, 0);
		}
		return data;
	}

	var generateHeightAtPoint = function(w, h, t) {
		var x = w + t * wMoveSpeed;
		var y = h + t * hMoveSpeed;
		var quality = 1;
		var result = 0;
		for (var j = 0; j < 4; j ++) {
			result += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
			quality *= 5;
		}
		return result;
	}

	var generateTexture = function(data, width, height) {
		var canvas, canvasScaled, context, image, imageData,
		level, diff, vector3, sun, shade;
		vector3 = new THREE.Vector3( 0, 0, 0 );
		sun = new THREE.Vector3( 1, 1, 1 );
		sun.normalize();
		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;
		context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );
		image = context.getImageData( 0, 0, canvas.width, canvas.height );
		imageData = image.data;
		for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = data[ j - 2 ] - data[ j + 2 ];
			vector3.y = 2;
			vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
			vector3.normalize();
			shade = vector3.dot( sun );
			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		}
		context.putImageData( image, 0, 0 );
		// Scaled 4x
		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );
		image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;
		for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
			var v = ~~ ( Math.random() * 5 );
			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;
		}
		context.putImageData( image, 0, 0 );
		return canvasScaled;
	}

	var heights, platform, platformMesh, platformBottom, platformBottomMesh;

	var init = function() {

		heights = generateHeight(worldWidth, worldHeight);

		geometry = new THREE.PlaneBufferGeometry(15000, 15000, worldWidth - 1, worldHeight - 1);
		geometry.rotateX( - Math.PI / 2 );
		geometry.rotateY(Math.PI);
		geometry.dynamic = true;

		
		var vertices = geometry.attributes.position.array;

		for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
			vertices[j + 1] = heights[i] * 10;
		}

		texture = new THREE.CanvasTexture( generateTexture( heights, worldWidth, worldHeight ) );
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		
		
		//reference: https://threejs.org/docs/api/materials/MeshPhongMaterial.html
		// material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 0, shading: THREE.SmoothShading, wireframe:false, side: THREE.DoubleSide});
		// mesh = new THREE.Mesh(geometry,material);

		
		scene.add(mesh);
		return that;
	}

	return init();
}