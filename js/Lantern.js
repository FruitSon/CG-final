function Lantern(camera,scene,renderer,num) {
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
		for(var i = 0; i < glowbuffer.length; i ++){
			glowbuffer[i].material.uniforms.viewVector.value = 
			new THREE.Vector3().subVectors( camera.position, glowbuffer[i].position);
		}

	}

	var generateLights = function (camera,scene,renderer,num){
		//set Up
		lanternMaterial = new THREE.MeshPhongMaterial({ color:0xff7700});
		lanternTexture = THREE.TextureLoader('img/lanternTexture.jpg');
		lanternMaterial.map = lanternTexture;
		lanternGeo = new THREE.CylinderGeometry(500,300,700,4);
		lanternGlowGeo = new THREE.CylinderGeometry(500,500,700,4);

		//subdivision
		modifier = new THREE.SubdivisionModifier(1);
		modifier.supportUVs = false;
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

		//generate #num lanterns
		for(var i = 0; i < 20; i++){
			var p = generateInitialPosition();
			var s = Math.random();
			var t_lantern = lantern.clone();
			// var t_lanternGlow = new THREE.Mesh( lanternGlowGeo.clone(), new THREE.MeshBasicMaterial({color: 0xffff00}));
			var t_lanternGlow = new THREE.Mesh( lanternGlowGeo.clone(), shaderMaterial);
			t_lantern.position.set(p.x,p.y,p.z);
			t_lanternGlow.position.set(p.x,p.y,p.z);
			t_lantern.scale.multiplyScalar(s);
			t_lanternGlow.scale.multiplyScalar(s*2);
			scene.add(t_lantern);
			scene.add(t_lanternGlow);
			glowbuffer.push(t_lanternGlow);
		}

	}

	/**
	 * randomly generate the coordinate to place the lantern
	 *
	 * @return     {Object}  { the x,y,z coordinate}
	 */
	var generateInitialPosition = function() {
		var x = 0 + (1-Math.random()*2)*8000;
		var y = 0 + (1-Math.random()*2)*8000;
		var z = 0+(1-Math.random()*2)*1000;
		return {'x':x, 'y':y, 'z':z};
	}

	var count = 0, single, singleGlow;
	var amp = 300;

	var lantern, lanternGeo, lanternMaterial, glowGeo;
	var modifier;
	var glowbuffer = [];

	var init = function() {
		generateLights(camera,scene,renderer,num);
		return that;
	}

	return init();
}



