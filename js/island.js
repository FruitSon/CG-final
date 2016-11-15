var canvas = document.getElementById('scene');
var canvasCtx = canvas.getContext("2d");

var camera, scene, light, renderer, analyzer, terrain;
var mesh;

init();
render();

function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	// camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
	// camera.position.z = 400;
	camera.position.y = 5000;
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled;

	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	// initialize audio analyzer
	analyzer = AudioAnalyzer('https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg');
	window.addEventListener('load', analyzer.startPlaying, false);

	// initialize terrain
	terrain = Terrain(scene);
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );
	// rotate
	// mesh.rotation.x += 0.005;
	// mesh.rotation.y += 0.01;
	renderer.render( scene, camera );
	// draw();
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
