function Matcher(options, audioReadyHandler) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext = new AudioContext();
	var analyserNode = null;
	
	var audioReady = audioReadyHandler;
	if (!audioReady) {
		audioReady = function() {}
	}
	
	var opt = options ? new SoundKeyMatching(options) : new SoundKeyMatching(SoundKeyMatching.createOptions());
	var matching = opt;
	
	var samplePackage = [];
	
	var samplingHandler = function() {};
	function sampleReceived(sample) {
		if (/*opt.samplingType == 1 && */samplePackage.length > 0) {
			if (sample.volume > samplePackage[0].volume) {
				samplePackage[0] = sample;
			}
		} else {
			samplePackage.push(sample);
		}
		console.log("sample received #" + samplePackage.length);
		lastSample = sample;
		samplingHandler(sample);
	}
	matching.setSamplingHandler(sampleReceived);
	this.setSamplingHandler = function(handler) {
		samplingHandler = handler;
	}
	this.setDebugHandler = matching.setDebugHandler;
	
	var samplingTimer = null;
	var matchingTimer = null;

	
	this.createAnalyser = function(canvasId, minFreqRatio, maxFreqRatio, source) {
		if (!minFreqRatio || minFreqRatio < 0.0 ||
			minFreqRatio > maxFreqRatio) {
			minFreqRatio = 0.0;
		}
		if (!maxFreqRatio || maxFreqRatio > 1.0 ||
			maxFreqRatio < minFreqRatio) {
			maxFreqRatio = 1.0;
		}

		var analyser = {};
		analyser.id = canvasId;
		var canvas = document.getElementById(analyser.id);
		/*
		if (!source) {
			source = "audio input";
		}
		if (typeof(source) === "string" && source === "audio input") {	// predefined source
			analyser.source = 
		} else if (typeof(source) === "object" && source.type === "sample") {	// sample
			analyser.source = 
		} else {
			analyser.source = "audio input";
		}
		*/
		
		analyser.width = canvas.width;
		analyser.height = canvas.height;
		analyser.context = canvas.getContext("2d");
		analyser.minFreqRatio = minFreqRatio;
		analyser.maxFreqRatio = maxFreqRatio;
		return analyser;
	}
	
	this.startAnalyser = function(analyser) {
		loopingAnanlyser.push(analyser);
		if (loopingAnanlyser.length == 1) {
			this.drawingLoop();
		}
	}
	
	this.stopAnalyser = function(analyser) {
		loopingAnanlyser.pop(analyser);
	}
	
	var loopingAnanlyser = [];
	var that = this;
	this.drawingLoop = function() {
		for (var i in loopingAnanlyser) {
			var analyser = loopingAnanlyser[i];
			that.drawAnalyser(analyser);
		}
		if (loopingAnanlyser.length > 0) {
			window.requestAnimationFrame(that.drawingLoop);
		}
	}

	var lastSample = SoundKeyMatching.createEmptySample();
	
	this.drawAnalyser = function(analyser) {
		if (!analyser || !analyser.context) {
			return false;
		}
		// clear canvas
        analyser.context.clearRect(0, 0, analyser.width, analyser.height);
		
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(analyser.width / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(freqByteData); 
		
        analyser.context.clearRect(0, 0, analyser.width, analyser.height);
        analyser.context.fillStyle = '#F6D565';
        //analyserContext.lineCap = 'round';
        //var multiplier = analyserNode.frequencyBinCount / numBars;
		var regionStart = Math.floor(analyserNode.frequencyBinCount * analyser.minFreqRatio);
		var regionEnd = Math.floor(analyserNode.frequencyBinCount * (analyser.minFreqRatio + analyser.maxFreqRatio));
		var multiplier = (regionEnd - regionStart) / numBars;

		var SAMPLE_DRAW_TYPE = 2;	// 1: bar, 2: line
        // Draw rectangle for each frequency bin.
		var firstPath = true;
		if (SAMPLE_DRAW_TYPE === 2) {
			analyser.context.beginPath();
		}
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset1 = regionStart + Math.floor( i * multiplier );
			var offset2 = Math.floor((i + 1) * multiplier ) - offset1;
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
			for (var j = 0; j < offset2; j++) {
                magnitude += freqByteData[offset1 + j];
				// 범위 안에 샘플 peak 이 존재하면 그리자.
				
				if (lastSample && lastSample[offset1 + j]) {
					if (SAMPLE_DRAW_TYPE === 1) { // 막대 그래프
						analyser.context.fillStyle = "#FFFFFF";
						analyser.context.fillRect(i * SPACING, analyser.height, BAR_WIDTH, -lastSample[offset1 + j]);
					} else if (SAMPLE_DRAW_TYPE === 2) { // 꺽은선 그래프
						if (firstPath) {
							analyser.context.moveTo(i * SPACING, analyser.height - lastSample[offset1 + j]);
							firstPath = false;
						} else {
							analyser.context.lineTo(i * SPACING, analyser.height - lastSample[offset1 + j]);
						}
					} 
				}
			}
					
			magnitude = magnitude / offset2;
            analyser.context.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyser.context.fillRect(i * SPACING, analyser.height, BAR_WIDTH, -magnitude);
        }
		if (SAMPLE_DRAW_TYPE === 2) {
			//analyser.context.lineWidth = 10;
			// set line color
			analyser.context.strokeStyle = '#FFFFFF';
			analyser.context.stroke();
		}
		
		return true;
	}
	
	this.drawSampleToAnalyser = function(analyser, sample) {
		if (!analyser || !analyser.context || !sample || !sample.type) {
			return false;
		}
		
		var regionStart = Math.floor(analyserNode.frequencyBinCount * analyser.minFreqRatio);
		var regionEnd = Math.floor(analyserNode.frequencyBinCount * (analyser.minFreqRatio + analyser.maxFreqRatio));
		var regionLength = regionEnd - regionStart;
		var multiplier = (regionEnd - regionStart) / numBars;
		
		for (var i in sample) {
			if (isNaN(parseInt(i, 10))) break;
			
			var freq = sample[i];
			if (freq < regionStart) continue;
			if (freq <= regionEnd) break;

			var BAR_WIDTH = 1;
			analyser.context.fillStyle = '#FFFFFF';
			analyser.context.fillRect((freq - regionStart) * SPACING, analyser.height, BAR_WIDTH, -magnitude);
		}
	}
	
	this.drawSample = function(canvasId, sample, minFreqRatio, maxFreqRatio) {
		if (!minFreqRatio || minFreqRatio < 0.0 ||
			minFreqRatio > maxFreqRatio) {
			minFreqRatio = 0.0;
		}
		if (!maxFreqRatio || maxFreqRatio > 1.0 ||
			maxFreqRatio < minFreqRatio) {
			maxFreqRatio = 1.0;
		}
		var canvas = document.getElementById(analyser.id);
		
		// todo
	}

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
		
		audioReady();
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
		matching.resetSampling();
		lastSample = SoundKeyMatching.createEmptySample();
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
			matching.resetMatch();
		}
	}
	
	initAudio();
}

Matcher.createOptions = function() {
	var option = SoundKeyMatching.createOptions();
	return option;
}
