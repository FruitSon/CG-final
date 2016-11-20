var hMoveSpeed = 6;
var wMoveSpeed = 0;
var pixelWidth = 7500;
var pixelHeight = 7500;
var worldWidth = 256;
var worldHeight = 256;
var resolution = 16;
var scale = 5;

function Terrain(scene) {
	var that = {};

	var VertexSource = `
		uniform float time;

	    varying vec2 vUv;
	    varying vec3 gPosition;

	    ${NoiseSource}

	    void main() {
	    	float maxHeight = 1500.0;

	        vUv = uv;
	        vec4 temp = modelMatrix * vec4(position, 1);
	        gPosition = temp.xyz / temp.w;
	        gPosition.x += time * ${FPS * hMoveSpeed / 1000};
	        gPosition.y = fBm(gPosition.x / 1000.0, 71.0, gPosition.z / 1000.0) * maxHeight;
	        temp.y = gPosition.y * temp.w;
	        gl_Position = projectionMatrix * viewMatrix * temp;
	    }
	`;

	var FragmentSource = `
		uniform float time;
		varying vec3 gPosition;

		${NoiseSource}

	    void main() {
	    	float scale = 200.0;
	    	float size = 20.0;

	        vec2 local = mod(gPosition.xz, scale);
	        if (distance(local, vec2(scale / 2.0, scale / 2.0)) < size) {
		        gl_FragColor = vec4(vec3(1.0), 1.0);
		    } else {
		    	gl_FragColor = vec4(vec3(0.0), 1.0);
		    }
	        
	    }
	`;
	
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
				vertices[3 * (j * worldWidth + i) + 1] = heights[j * worldWidth + i] * scale;
			}
		}

		for (var i = worldWidth - wMoveSpeed; i < worldWidth; i ++) {
			for (var j = 0; j < worldHeight - hMoveSpeed; j ++) {
				heights[j * worldWidth + i] = generateHeightAtPoint(i, j, t);
				vertices[3 * (j * worldWidth + i) + 1] = heights[j * worldWidth + i] * scale;
			}
		}

		geometry.attributes.position.needsUpdate = true;
		
		texture = new THREE.CanvasTexture( generateTexture( heights, worldWidth, worldHeight ) );
		mesh.material.map = texture;
		texture.needsUpdate = true;
	};

	var mesh, geometry, texture, heights;

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

	var init = function() {

		heights = that.heights = generateHeight(worldWidth, worldHeight);

		geometry = new THREE.PlaneBufferGeometry(pixelWidth, pixelHeight, worldWidth - 1, worldHeight - 1);
		geometry.rotateX( - Math.PI / 2 );
		geometry.rotateY(Math.PI);
		geometry.dynamic = true;

		
		// var vertices = geometry.attributes.position.array;

		// for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
		// 	vertices[j + 1] = heights[i] * scale;
		// }

		var uniforms = that.uniforms = {
	        time: { value: 1.0 },
	        octaves: { value: 4 },
	        lacunarity: { value: 0.8 },
	        gain: { value: 0.5 }
	    }

	    var material = new THREE.ShaderMaterial( {
	        uniforms: uniforms,
	        vertexShader: VertexSource,
	        fragmentShader: FragmentSource
	    } );

		// texture = new THREE.CanvasTexture( generateTexture( heights, worldWidth, worldHeight ) );
		// texture.wrapS = THREE.ClampToEdgeWrapping;
		// texture.wrapT = THREE.ClampToEdgeWrapping;

		// mesh = that.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		mesh = that.mesh = new THREE.Mesh(geometry, material);

		var light,helper,material;
		//reference: https://threejs.org/docs/api/materials/MeshPhongMaterial.html
		// material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 0, shading: THREE.SmoothShading, wireframe:false, side: THREE.DoubleSide});
		// mesh = new THREE.Mesh(geometry,material);

		return that;
	}

	return init();
}