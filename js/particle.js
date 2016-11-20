function Particle(){
	this.particles = new THREE.Object3D();
}

Particle.prototype.create = function(num){
	for(var i = 0 ; i < num ; i++){
		
		var pcolor;
		var c = getRandomInt(1, 11)
		switch(c){
			case 0: pcolor = 0xFFCCCC;break;
			case 1: pcolor = 0xFFFFCC;break;
			case 2: pcolor = 0xFF9999;break;
			case 3: pcolor = 0xFF3366;break;
			case 4: pcolor = 0xFF6666;break;
			case 5: pcolor = 0xFF0099;break;
			case 6: pcolor = 0x996666;break;
			case 7: pcolor = 0xCCFF99;break;
			case 8: pcolor = 0xFFFFFF;break;
			case 9: pcolor = 0xFFCC66;break;
		}
		var geometry = new THREE.OctahedronBufferGeometry(5);
		var material = new THREE.MeshBasicMaterial( {color: pcolor} );
		var octa = new THREE.Mesh(geometry, material);
		var quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI * i * 45 / 180 );
		octa.matrix.makeRotationFromQuaternion(quaternion);
		octa.matrix.setPosition(new THREE.Vector3(Math.random() * i , Math.pow(-1,i) * Math.random() * i,Math.pow(-1,i) * Math.random() * i));
		octa.matrixAutoUpdate = false;
		this.particles.add(octa);
	}
}

Particle.prototype.move = function(t){
	this.particles.matrix.setPosition(new THREE.Vector3(Math.sin(t * Math.PI/180) * 1000, Math.cos(t * Math.PI/180) * 1000 , Math.cos(t * Math.PI/180) * 1000));
	this.particles.matrixAutoUpdate = false;
	for(var i = 0 ; i < this.particles.children.length ; i++){
		var quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI * i * 45 / 180 );
		this.particles.children[i].matrix.makeRotationFromQuaternion(quaternion);
		this.particles.children[i].matrix.setPosition(new THREE.Vector3(Math.pow(-1,i) * Math.random() * i * 10 ,  Math.random() * i * 10, Math.pow(-1,i) * Math.random() * i * 10));
		this.particles.children[i].matrixAutoUpdate = false;
	}

}