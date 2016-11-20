function Ball() {
	var that = {};

	var FragmentSource = `
	    uniform float time;
	    
	    ${NoiseSource}

	    varying vec3 gPosition;
	    varying vec2 vUv;

	    void main() {
	    	float x = gPosition.x / 100.0;
	        float y = gPosition.y / 100.0;
	        float z = gPosition.z / 100.0;

	        float r = 80.0 / 256.0;
	        float g = 30.0 / 256.0;
	        float b = 30.0 / 256.0;

	        float value = wood(x, y, z);

	        gl_FragColor = vec4(r + value, g + value, b, 0.5);
	    }
	`;

	var init = function() {
		var geometry = new THREE.BoxBufferGeometry( 2000, 2000, 2000 );

		var octaves = 4, lacunarity = 1, gain = 0.1;

	    var uniforms = {
	        time: { value: 1.0 },
	        octaves: { value: octaves },
	        lacunarity: { value: lacunarity },
	        gain: { value: gain}
	    }

	    var material = that.material = new THREE.ShaderMaterial( {
	        uniforms: uniforms,
	        vertexShader: VertexSource,
	        fragmentShader: FragmentSource
	    } );

		var mesh = that.mesh = new THREE.Mesh(geometry, material);
		return that;
	}

	return init();
}