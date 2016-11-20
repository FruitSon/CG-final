function AnimationInterpolater(frames, interval, fps) {
	var that = {};

	/**
	 * get the frame of current time or a given time
	 * @param  {undefined or int} t the timestamp in millisecond, or undefined if want to get the current frame
	 * @return {Array}   the current frame
	 */
	var getFrame = that.getFrame = function(t) {
		var frame = new Array();
		var curTime = t;
    	console.log(curTime,lastTime,startTime);

		if (curTime === undefined) {
			curTime = new Date().getTime();
		} else if (curTime - lastTime < 1000 / fps) {
			return frame;
		} else {
			lastTime = curTime;
		}

    	var t = ((curTime - startTime) % interval) *1.0/ interval;
	    var fn = Math.floor(((curTime - startTime) / interval)) % frames.length;
	    for (var i = 0; i < frames[fn].length; i ++) {
	    	frame.push((1 - t) * frames[fn][i] + t * frames[(fn + 1) % frames.length][i]);
	    }
	    return frame;
	}

	var startTime, lastTime;

	var init = function() {
		startTime = new Date().getTime();
		lastTime = startTime;
		return that;
	}
	return init();
}