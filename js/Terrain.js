var hMoveSpeed = 6;
var wMoveSpeed = 0;
var pixelWidth = 15000;
var pixelHeight = 15000;
var worldWidth = 256;
var worldHeight = 256;
var resolution = 16;
var scale = 5;
var clock = new THREE.Clock();

function Terrain(scene) {
	var that = {};

	var VertexSource = `
		uniform float time;

	    varying vec3 gPosition;

	    ${NoiseSource}

	    void main() {
	    	float maxHeight = 1500.0;

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
	    	float scale = 500.0;
	    	float size = 50.0;

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

	var t = 0;

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

	var init = function() {
		geometry = new THREE.PlaneBufferGeometry(pixelWidth, pixelHeight, worldWidth - 1, worldHeight - 1);
		geometry.rotateX( - Math.PI / 2 );
		geometry.rotateY(Math.PI);

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

		mesh = that.mesh = new THREE.Mesh(geometry, material);

		return that;
	}

	return init();
}