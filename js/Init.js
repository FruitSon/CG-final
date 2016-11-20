var FPS = 30.0;

// initialize audio analyzer
// var analyzer = AudioAnalyzer('https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg');
var analyzer = AudioAnalyzer('audio/Tek.mp3');
window.addEventListener('load', analyzer.startPlaying, false);

// var canvas = document.querySelector('.visualizer');
// var canvasCtx = canvas.getContext("2d");

// draw();

// function draw() {
// 	requestAnimationFrame( draw );
// 	var audioData = analyzer.analyze();
// 	if (audioData === undefined) {
// 		return;
// 	}

// 	// var sum = 0;
// 	// var max = 0;
// 	// for (var i = 0; i < audioData.length; i ++) {
// 	// 	sum += audioData[i];
// 	// 	max = Math.max(max, audioData[i]);
// 	// }
// 	// var avg = sum / audioData.length;

// 	// console.log('max:' + max, ',avg:' + avg);

// 	var WIDTH = canvas.width;
// 	var HEIGHT = canvas.height;
// 	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

// 	canvasCtx.fillStyle = 'rgb(200, 200, 200)'; // draw wave with canvas
// 	canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

// 	canvasCtx.lineWidth = 2;
// 	canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

// 	canvasCtx.beginPath();

// 	var sliceWidth = WIDTH * 1.0 / audioData.length;
// 	var x = 0;

// 	for(var i = 0; i < audioData.length; i++) {
// 		var v = audioData[i] / 128.0;
// 		var y = v * HEIGHT/2;

// 		if(i === 0) {
// 		  canvasCtx.moveTo(x, y);
// 		} else {
// 		  canvasCtx.lineTo(x, y);
// 		}

// 		x += sliceWidth;
// 	}

// 	canvasCtx.lineTo(canvas.width, canvas.height/2);
// 	canvasCtx.stroke();
// }