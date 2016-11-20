function Stage(){
	var that = {};

	var init = function() {
		var texture = new THREE.TextureLoader().load('img/grass.jpg');
		var material = new THREE.MeshStandardMaterial( { roughness:0.8,color: 0x336600,map:texture } );
		var geometry = new THREE.CylinderBufferGeometry( 1500, 1000, 300 );

		var base = new THREE.PlaneBufferGeometry(1800,1800,1799,1799);
		var vertices = base.attributes.position.array;
		var heights = generateHeightMap(2000,2000,200);

		base.rotateX( - Math.PI / 2 );
		base.rotateY(Math.PI);
		base.position = geometry.position;

		for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
			vertices[j + 1] = heights[i] * Math.random()*1000;
		}

		var meshBase = new THREE.Mesh(base, material);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.add(meshBase);


		that.mesh = mesh;
		return that;
	}

	return init();
}