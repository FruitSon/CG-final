function Stage(scene){
	var that = {};

	var init = function() {
		var texture = new THREE.TextureLoader().load( 'img/yuan.jpeg' );
		var material = new THREE.MeshBasicMaterial( { map: texture } );
		var geometry = new THREE.BoxBufferGeometry( 3000, 200, 3000 );
		geometry.translate(0, 3000, 0);
		
		var mesh = new THREE.Mesh(geometry, material);
		scene.add( mesh );
		return that;
	}

	return init();
}