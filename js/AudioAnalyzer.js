function AudioAnalyzer(url) {
	var that = {};

	var analyze = that.analyze = function() {
		if (finished === true) {
			analyzer.fftSize = 2048;
			var bufferLength = analyzer.fftSize;
			audioData = new Uint8Array(bufferLength);
			analyzer.getByteTimeDomainData(audioData);
			return audioData;
		}
	  //   analyser.fftSize = 256;
	  //   var bufferLength = analyser.frequencyBinCount;
	  //   audioData = new Uint8Array(bufferLength);
	  //   analyser.getByteFrequencyData(audioData);

	  //   function drawFrequency() {

			// canvasCtx.fillStyle = 'rgb(0, 0, 0)';
			// canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			// var barWidth = (WIDTH / bufferLength) * 2.5;
			// var barHeight;
			// var x = 0;

			// for(var i = 0; i < bufferLength; i++) {
			// 	barHeight = audioData[i];

			// 	canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
			// 	canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

			// 	x += barWidth + 1;
			// }
	  //   }

	  //   drawFrequency();
	}

	var startPlaying = that.startPlaying = function() {
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			context = new AudioContext();
			finished = false;
		} catch(e) {
			alert('Web Audio API is not supported in that browser');
		}
		
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		request.onload = function() {
			context.decodeAudioData(
				request.response, 
				finishedLoading, 
				function(e) {"Error with decoding audio data" + e.err}
			);
		}

		request.send();
	};

	var source, analyzer, audioData, finished, url;

	var finishedLoading = function(buffer) {
		source = context.createBufferSource();
		source.buffer = buffer;

		analyzer = context.createAnalyser();
		source.connect(analyzer);

		analyzer.connect(context.destination);
		source.start(0);

		finished = true;
	};

	var init = function() {
		return that;
	}

	return init();
}