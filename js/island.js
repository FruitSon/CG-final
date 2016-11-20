// var canvas = document.getElementById('scene');
// var canvasCtx = canvas.getContext("2d");

var camera, scene, light, renderer, analyzer;

var terrain, stage, tree, ball;

var startTime, lastTime;

init();
render();

function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	// camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set(0, 10000, 0);
	camera.rotation.x = Math.PI / 2;
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xcce0ff);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 1, 0 );
	controls.update();

	//light
	light = new THREE.SpotLight(0xffffff, 1);
	light.position.set(0, 10000, -20000);
	light.castShadow = true;
	light.receiveShadow = true;
	helper = new THREE.CameraHelper( light.shadow.camera );

	// scene.add(helper);
	scene.add(light);

	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	// initialize audio analyzer
	// analyzer = AudioAnalyzer('https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg');
	// window.addEventListener('load', analyzer.startPlaying, false);

	// initialize scenes
	terrain = Terrain(scene);
	scene.add(terrain.mesh);

	stage = Stage();
	stage.mesh.translateY(1500);
	stage.mesh.translateZ(1000);
	scene.add(stage.mesh);

	ball = Ball();
	ball.mesh.translateY(2000);
	scene.add(ball.mesh);

	tree = DrawTree();
	tree.translateY(1500);
	tree.translateZ(1000);
	scene.add(tree);

	startTime = Date.now();
	lastTime = startTime;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );

	var currentTime = Date.now();
	if (currentTime - lastTime >= 1000 / FPS) {
		lastTime = currentTime;
		// rotate
		// mesh.rotation.x += 0.005;
		// mesh.rotation.y += 0.01;
		// terrain.updateData();
		terrain.uniforms['time'].value = Date.now() - startTime;
		
		renderer.render( scene, camera );
		// draw();
	}
	
	

	// var gl = renderer.getContext();
 //    var compiled = gl.getShaderParameter(ball.material.program, gl.COMPILE_STATUS);
 //    console.log('Shader compiled successfully: ' + compiled);
 //    var compilationLog = gl.getShaderInfoLog(ball.material.program);
 //    console.log('Shader compiler log: ' + compilationLog);
 //    debugger;
}

function draw() {
	var audioData = analyzer.analyze();
	if (audioData === undefined) {
		return;
	}

	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

	canvasCtx.fillStyle = 'rgb(200, 200, 200)'; // draw wave with canvas
	canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

	canvasCtx.lineWidth = 2;
	canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

	canvasCtx.beginPath();

	var sliceWidth = WIDTH * 1.0 / audioData.length;
	var x = 0;

	for(var i = 0; i < audioData.length; i++) {
		var v = audioData[i] / 128.0;
		var y = v * HEIGHT/2;

		if(i === 0) {
		  canvasCtx.moveTo(x, y);
		} else {
		  canvasCtx.lineTo(x, y);
		}

		x += sliceWidth;
	}

	canvasCtx.lineTo(canvas.width, canvas.height/2);
	canvasCtx.stroke();
}
