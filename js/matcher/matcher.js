function Matcher(options) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext = new AudioContext();
	var analyserNode = null;
	
	var opt = options ? new SoundKeyMatching(options) : new SoundKeyMatching(SoundKeyMatching.createOptions());
	var matching = opt;
	
	var samplePackage = [];
	
	function sampleReceived(sample) {
		if (opt.samplingType == 1 && samplePackage.length > 0) {
			if (sample.volume > samplePackage[0].volume) {
				samplePackage[0] = sample;
			}
		} else {
			samplePackage.push(sample);
		}
		console.log("sample received #" + samplePackage.length);
	}
	matching.setSamplingHandler(sampleReceived);
	this.setDebugHandler = matching.setDebugHandler;
	
	var samplingTimer = null;
	var matchingTimer = null;
	
	function gotMatchingStream(stream) {
		var inputPoint = audioContext.createGain();

		// Create an AudioNode from the stream.
		var realAudioInput = audioContext.createMediaStreamSource(stream);
		var audioInput = realAudioInput;
		audioInput.connect(inputPoint);

		analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );

		var zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect( zeroGain );
		zeroGain.connect( audioContext.destination );
	}

	function initAudio() {
			if (!navigator.getUserMedia)
				navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			if (!navigator.cancelAnimationFrame)
				navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
			if (!navigator.requestAnimationFrame)
				navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

		navigator.getUserMedia({audio:true}, gotMatchingStream, function(e) {
				alert('Error getting audio');
				console.log(e);
			});
	}	
	
	function doSampling() {
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(freqByteData); 
		matching.doSampling(freqByteData);
	}
	
	this.startSampling = function() {
		// 이미 샘플링 중이면 중지
		if (samplingTimer) {
			this.stopSampling();
		}
		// 샘플 패키지 버퍼 초기화
		samplePackage = [];
		// 샘플링 시작
		samplingTimer = setInterval(doSampling, 1000 / opt.samplingFreq);
	}
	
	// return samplePackage
	this.stopSampling = function() {
		if (samplingTimer) {
			clearInterval(samplingTimer);
			samplingTimer = null;
		}
		return samplePackage;
	}
	
	function doMatching() {
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(freqByteData); 
		matching.doMatching(freqByteData);
	}
	
	// packages = samplePackage[]
	// callback matchingHandler(sampleIndex)
	this.startMatching = function(packages, matchingHandler) {
		// 이미 매칭 중이면 중지
		if (matchingTimer) {
			this.stopMatching();
		}
		// 매칭 핸들러 등록
		for (var i in packages) {
			var samplePackage = packages[i];
			for (var j in samplePackage) {
				matching.addMatch(samplePackage[j], matchingHandler, i);
			}
		}
		// 매칭 시작
		matchingTimer = setInterval(doMatching, 1000 / opt.matchingFreq);
	}
	
	this.stopMatching = function() {
		if (matchingTimer) {
			clearInterval(matchingTimer);
			matchingTimer = null;
		}
	}
	
	initAudio();
}
