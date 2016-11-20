function Lantern(camera) {
	var that = {};
	var vertexSource = `
		uniform vec3 viewVector;
		uniform float c;
		uniform float p;
		varying float intensity;
		void main() 
		{
		    vec3 vNormal = normalize( normalMatrix * normal );
			vec3 vNormel = normalize( normalMatrix * viewVector );
			intensity = pow( c - dot(vNormal, vNormel), p );
			
		    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	var fragmentSource = `
		uniform vec3 glowColor;
		varying float intensity;
		void main() 
		{
			vec3 glow = glowColor * intensity;
		    gl_FragColor = vec4( glow, 1.0 );
		}
	`;

	//update the uniforms when the camera rotate
	var update = that.update = function() {
		lanternGlow.material.uniforms.viewVector.value = 
		new THREE.Vector3().subVectors( camera.position, lanternGlow.position);

		// life --;
		// if (life == 0) {
		// 	return true;
		// }

		// var lvs = lantern.geometry.vertices;
		// for(var i = 0; i < lvs.length; i ++) {
		// 	lvs[i].x += speed[0];
		// 	lvs[i].y += speed[1];
		// 	lvs[i].z += speed[2];
		// }
		
		// var lgvs = lanternGlow.geometry.vertices;
		// for(var i = 0; i < lgvs.length; i ++) {
		// 	lgvs[i].x += speed[0];
		// 	lgvs[i].y += speed[1];
		// 	lgvs[i].z += speed[2];
		// }
		
		// lantern.geometry.verticesNeedUpdate = true;
		// lanternGlow.geometry.verticesNeedUpdate = true;

		// return false;
	}

	var generateLights = function (camera){
		//set Up
		lanternMaterial = new THREE.MeshPhongMaterial({ color:0xff7700});
		lanternTexture = THREE.TextureLoader('img/lanternTexture.jpg');
		lanternMaterial.map = lanternTexture;
		lanternGeo = new THREE.CylinderGeometry(500,300,700,4);
		lanternGlowGeo = new THREE.CylinderGeometry(500,500,700,4);

		//subdivision
		modifier = new THREE.SubdivisionModifier(1);
		modifier.modify(lanternGlowGeo);
		lantern = new THREE.Mesh(lanternGeo, lanternMaterial);

		//setup shaderMaterial, pass parameters into glsl
		var shaderMaterial = new THREE.ShaderMaterial({
			uniforms:{
				c : {value : 0.2},
				p : {value : 4.4},
				glowColor : {value: new THREE.Color(0xffff00)},
				viewVector : {value: new THREE.Vector3(camera.position.x, camera.position.y,camera.position.z)}
			},
			vertexShader : vertexSource,
			fragmentShader : fragmentSource,
			transparent: true,
			blending : THREE.AdditiveBlending
		});

		
		var s = Math.random();
		lanternGlow = new THREE.Mesh( lanternGlowGeo, shaderMaterial);
		lantern.position.set(initPosition[0], initPosition[1], initPosition[2]);
		lanternGlow.position.set(initPosition[0], initPosition[1], initPosition[2]);
		lantern.scale.multiplyScalar(s);
		lanternGlow.scale.multiplyScalar(s*2);

		mesh = that.mesh = new THREE.Object3D();
		mesh.add(lantern);
		mesh.add(lanternGlow);
	}

	/**
	 * randomly generate the coordinate to place the lantern
	 *
	 * @return     {Object}  { the x,y,z coordinate}
	 */
	var randomPosition = function() {
		var x = 0 + (1 - 2 * Math.random())*10000;
		var y = 0 + (1 - 2 * Math.random())*5000;
		var z = 0 + (1 - 2 * Math.random())*10000;
		return [x, y, z];
	}

	var lantern, lanternGlow, initPosition, finalPosition, mesh, life = FPS * Math.random() * 100, speed;
	var modifier;

	var init = function() {
		initPosition = randomPosition();
		finalPosition = randomPosition();
		speed = [
			(finalPosition[0] - initPosition[0]) / life,
			(finalPosition[1] - initPosition[1]) / life,
			(finalPosition[2] - initPosition[2]) / life
		];
		generateLights(camera);
		return that;
	}

	return init();
}



