var hMoveSpeed = 10;
var wMoveSpeed = 10;
// var worldWidth = 256;
// var worldHeight = 256;
var worldWidth = 20;
var worldHeight = 20;
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


	var mesh;

	var init = function() {
		// data = generateHeight( worldWidth, worldHeight );

		var geometry = new THREE.PlaneBufferGeometry(7500, 7500, worldWidth - 1, worldHeight - 1);
		geometry.rotateX( - Math.PI / 2 );
		var vertices = geometry.attributes.position.array;

		var heights = generateHeightMap(worldWidth, worldHeight, 5);

		for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
			vertices[j + 1] = heights[i] * 1000;
		}

		// texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldHeight ) );
		// texture.wrapS = THREE.ClampToEdgeWrapping;
		// texture.wrapT = THREE.ClampToEdgeWrapping;
		// mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		
		//light
		light = new THREE.SpotLight(0xffffff,1);
		light.position.set(2000,2000,2000);
		light.castShadow = true;
		light.receiveShadow = true;
		helper = new THREE.CameraHelper( light.shadow.camera );
		material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 0, shading: THREE.SmoothShading, wireframe:false});
		mesh = new THREE.Mesh(geometry,material);

		// scene.add(helper);
		scene.add(light);
		scene.add(mesh);
		return that;
	}

	return init();
}