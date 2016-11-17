function Stage(){
	var that = {};

	var init = function() {
		var texture = new THREE.TextureLoader().load( 'img/yuan.jpeg' );
		var material = new THREE.MeshBasicMaterial( { map: texture } );
		var geometry = new THREE.BoxBufferGeometry( 2000, 200, 2000 );
		
		var mesh = that.mesh = new THREE.Mesh(geometry, material);
		return that;
	}

	return init();
}