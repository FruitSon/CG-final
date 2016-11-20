var camera, scene, light, renderer, analyzer, terrain, sky, lantern, paperman;
var mesh;

var terrain, stage, tr, ball;

var startTime, lastTime;

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

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 1, 0 );
	controls.update();

	//light
	light = new THREE.PointLight(0xffffff);
	light.position.set(0, 10000, 0);
	light.castShadow = true;

	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff));

	

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
	scene.add(stage.mesh);

	ball = Ball();
	ball.mesh.translateX(3000);
	ball.mesh.translateY(3000);
	scene.add(ball.mesh);

	sky = Sky();
	scene.add(sky.mesh);

	paperman = PaperMan();
	paperman.mesh.translateX(1000);
	paperman.mesh.translateY(3000);
	paperman.mesh.translateZ(1000);
	scene.add(paperman.mesh);

	console.log(paperman.mesh, paperman.mesh.position);

	// tree = DrawTree();
	// tree.translateY(1500);
	// tree.translateZ(1000);
	// scene.add(tree);

	lantern = Lantern(camera,scene,renderer,10);
	
	tr = new Tree();
	tr.Buildtree(6);
	tr.tree.translateY(1500);

	tr.tree.scale.multiplyScalar(30);
	scene.add(tr.tree);

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

		terrain.uniforms['time'].value = Date.now() - startTime;

		if(tr.time < tr.timeLimit){
	 		tr.CalBranchLength(tr.time);
	 		tr.time = (currentTime - startTime) / 1000;
	 		tr.RemoveAllBranch();
	 		tr.AddBranch();
		}

		lantern.update();

		//update model
		var skeletonLen = paperman.mesh.skeleton.bones.length;
		// console.log(paperman.mesh.skeleton.bones[0].position);
		var curP, expP;
		for(var i = 0; i < skeletonLen; i++){
			//get current position
			var tempP = paperman.mesh.skeleton.bones[i].position;
			curP = [tempP.x,tempP.y,tempP.z];
			expP = [tempP.x+3000,tempP.y+200,tempP.z+3000];
			var frames = [curP,expP];
			var res = AnimationInterpolater(frames, 1000, 30).getFrame();
			//translate the joint
			console.log(curP,expP);
			console.log(curP,res);
			paperman.mesh.skeleton.bones[i].position.set(res[0], res[1], res[2]);   

		}


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
