function Ball() {
	var that = {};

	var init = function() {
		var geometry = new THREE.BoxBufferGeometry( 2000, 2000, 2000 );
		var material = that.material = BallTexture();
		var mesh = that.mesh = new THREE.Mesh(geometry, material);
		return that;
	}

	return init();
}