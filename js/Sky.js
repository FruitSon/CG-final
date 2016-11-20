/**
 * contains the function to render the background environment
 *
 * @class      Sky (name)
 * @return     {<type>}  return the generated mesh
 */
var skyVertexShader = `
	varying vec2 vUV;
	void main(){
		vUV = uv;
		vec4 pos = vec4(position,1.0);
		gl_Position = projectionMatrix * modelViewMatrix * pos;
	}
`;

var skyFragmentShader = `
	varying vec2 vUV;
	uniform sampler2D texture;  
	void main(){
		vec4 mapping = texture2D(texture, vUV);
  		gl_FragColor = vec4(mapping.xyz, mapping.w);
	}
`;

function Sky() {
	var that = {};

	var init = function() {
		var geometry = new THREE.SphereBufferGeometry( 30000, 400, 400 );
		var uniform = {texture: { type: 't', value: new THREE.TextureLoader().load('img/background.jpg') }};
		var material = new THREE.ShaderMaterial({
			uniforms: uniform,
			vertexShader: skyVertexShader,
			fragmentShader: skyFragmentShader
		});

		var mesh = that.mesh = new THREE.Mesh(geometry, material);

		mesh.scale.set(-1, 1, 1);  
		mesh.rotation.order = 'XZY';  
		mesh.renderDepth = 2000.0;
		return that;
	}

	return init();
}