var camera, scene, light, renderer, terrain, lanterns = new Array();
var mesh;

var terrain, stage, tr, tree, ball, part;

var startTime, lastTime, framen = 0;

var max = 0, avg = 0, lon = 0, lat = 0;

init();
render();

function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 40000 );
	// camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set(0, 10000, 0);
	camera.rotation.x = Math.PI / 2;
	scene = new THREE.Scene();
	// scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;

	// var controls = new THREE.OrbitControls( camera, renderer.domElement );
	// controls.target.set( 0, 1, 0 );
	// controls.update();

	//light
	light = new THREE.PointLight(0xffffff);
	light.position.set(0, 10000, 0);
	light.castShadow = true;

	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff));

	
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	// initialize scenes
	terrain = Terrain(scene);
	scene.add(terrain.mesh);

	stage = Stage();
	stage.mesh.translateY(1500);
	scene.add(stage.mesh);

	sky = Sky();
	scene.add(sky.mesh);

	tree = DrawTree();
	tree.translateY(1500);
	tree.translateZ(1000);
	scene.add(tree);
	
	tr = new Tree();
	tr.Buildtree(5);
	tr.tree.translateY(1500);
	tr.tree.scale.multiplyScalar(20);
	scene.add(tr.tree);

	part = new Particle();
	part.create(100);
	part.particles.scale.multiplyScalar(10);
	part.particles.translateY(1500);

	scene.add(part.particles);


	startTime = Date.now();
	lastTime = startTime;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
var time = 0;
function render() {
	requestAnimationFrame( render );

	// analyze music
	var audioData = analyzer.analyze();
	if (audioData !== undefined) {
		var sum = 0;
		max = 0;
		for (var i = 0; i < audioData.length; i ++) {
			sum += audioData[i];
			max = Math.max(max, audioData[i]);
		}
		avg = sum / audioData.length;
	}
    
	var currentTime = Date.now();
	if (currentTime - lastTime >= 1000 / FPS) {
		framen ++;
		lastTime = currentTime;

		terrain.uniforms['time'].value = Date.now() - startTime;

		// lantterns
		for (var i = lanterns.length - 1; i >= 0 ; i --) {
			if (lanterns[i].update()) {
				scene.remove(lanterns[i].mesh);
				lanterns.splice(i, 1);
			}
		}

		for (var i = 0; i < max - 220; i ++) {
			var lantern = Lantern(camera);
			lanterns.push(lantern);
			scene.add(lantern.mesh);
		}

		// camera
		if (Math.floor(framen / 500) % 4 === 0) {
			lon += 0.4;
			lat = Math.sin(THREE.Math.degToRad(framen)) * 10 + 70;
			var phi = THREE.Math.degToRad( 90 - lat );
			var theta = THREE.Math.degToRad(lon);
			camera.position.x = 20000 * Math.sin( phi ) * Math.cos( theta );
			camera.position.y = 2000 + 4000 * Math.cos( phi );
			camera.position.z = 20000 * Math.sin( phi ) * Math.sin( theta );
			camera.lookAt(new THREE.Vector3(0, 0, 0));

			renderer.render( scene, camera );
		}

		// trees
		if(tr.time < tr.timeLimit){
	 		tr.CalBranchLength(tr.time);
	 		tr.time = (currentTime - startTime) / 1000;
	 		tr.RemoveAllBranch();
	 		tr.AddBranch();
		}

		
		part.move(time);
		time = time+1;
		renderer.render( scene, camera );
		// draw();
	}
	
}
