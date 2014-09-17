function SoundKeyMatching(options) {
	var samplingHandler = function() {};	// 샘플을 추출했을 때 알려줄 핸들러
	var debugHandler = function(message) {};	// 디버그 메시지를 출력
	var samplingFunction = null;
	var matchingFunction = null;
	var matchingData = [];	// 비교가 필요한 데이터들과 매칭결과를 알려줄 핸들러들
	var opt = applyOption(options);
	
	var info = {
		volumeLevel: 0,	// 현재 전체 볼륨 레벨
		maxLevel: opt.minSamplingVolumeLevel,	// 최대 level
		weightedLevel: 0,	// 볼륨 레벨에 정상/계곡 높이차이를 가산
		maxWeightedLevel: 0,
		sampleCount: 0,	// 샘플 추출 횟수
	};
	var maxLevelSampleData = null;	// 최대 level 일 때의 샘플링 데이터
	
	this.resetSampling = function () {
		info.maxLevel = opt.minSamplingVolumeLevel;
		info.maxWeightedLevel = info.maxLevel;
		info.sampleCount = 0;
	}
	
	// call periodically while do sampling
	// 반복적으로 호출해줘야 함 (초당 5~10회 추천)
	this.doSampling = function(data) {
		// 볼륨 크기를 구해서
		info.volumeLevel = 0;
		info.weightedLevel = 0;
		for (var i in data) {
			info.volumeLevel += data[i];
		}
		info.weightedLevel = info.volumeLevel;
		
		sampleData = samplingFunction(data, info.volumeLevel);
		
		// 정상과 계곡의 차이가 심할 수록 가중치를 둬서 샘플링되게 해준다.
		var lastFreq = 0;
		var lastLevel = 0;
		var maxLevel = 0;
		for (var i in sampleData) {
			if (i === "size") break;
			var freq = parseInt(i);
			var level = sampleData[i];
			var freqDistance = freq - lastFreq;
			var levelDistance = Math.abs(lastLevel - level);
			info.weightedLevel += parseInt((levelDistance * 100) / (freqDistance + 1));
			
			lastFreq = freq;
			lastLevel = lastLevel;
			
			if (level > maxLevel) {
				maxLevel = level;
			}
		}
		sampleData.volume = info.weightedLevel;
		
		//if (info.volumeLevel > info.maxLevel) {
		if (info.weightedLevel > info.maxWeightedLevel) {
			info.maxLevel = info.volumeLevel;
			info.maxWeightedLevel = info.weightedLevel;

			// high pass filter
			var newSample = {};
			var newSize = 0;
			for (var i in sampleData) {
				if (isNaN(parseInt(i))) {
					newSample[i] = sampleData[i];
				} else {
					if (sampleData[i] > maxLevel * opt.highPassRatio) {
						newSample[i] = sampleData[i];
						newSize++;
					}
				}
			}
			newSample.size = newSize;
			sampleData = newSample;
			
			maxLevelSampleData = sampleData; //samplingFunction(data, info.volumeLevel);
			this.samplingHandler(maxLevelSampleData);
			info.sampleCount++;
		}
		
		debug();
	}
	
	// 옵션 설정
	function applyOption(option) {
		if (option === undefined) {
			option = SoundKeyMatching.createOptions();
		}
		switch (option.samplingType) {
			case 1:	// volume level 검출 (테스트용)
				samplingFunction = getSampleFromData1;
				matchingFunction = matchSample1;
				break;
			case 2:	// peak 와 내리막 검출
				samplingFunction = getSampleFromData2;
				matchingFunction = matchSample2;
				break;
			case 3:	// 이동평균 peak 검출
				samplingFunction = getSampleFromData3;
				matchingFunction = matchSample3;
				break;
			default:
				break;
		}
		
		return option;
	}
	
	// 디버그 메시지 출력
	function debug() {
		var msg = "";
		for (var key in info) {
			msg += key + ":" + info[key] + "\n";
		}
		debugHandler(msg);
	}
	
	// call periodically while do matching
	// 반복적으로 호출해줘야 함 (초당 5~10회 추천)
	this.doMatching = function(data) {
		for (var i in matchingData) {
			var matchingItem = matchingData[i];
			if (matchingFunction(matchingItem.sample, data)) {
				matchingItem.handler(matchingItem.context);
			}
		}
	}
	
	// 디버그용 메시지 출력 핸들러
	this.setDebugHandler = function(handler) {
		debugHandler = handler;
	}
	
	// 샘플을 추출했을 때 호출할 핸들러를 등록
	this.setSamplingHandler = function(handler) {
		this.samplingHandler = handler;
	}
	
	// 샘플과 샘플이 매칭되었을 때 호출할 핸들러를 등록
	this.addMatch = function(sampleData, matchingHandler, contextData) {
		matchingData.push({sample: sampleData, handler: matchingHandler, context: contextData});
	}
	
	// 매칭 데이터를 초기화
	this.resetMatch = function() {
		matchingData = [];
	}
	
	// volume level 검출
	function getSampleFromData1(data, volume) {
		var sample = {};
		//sample.type = "sample";
		sample.volume = volume;
		return sample;
	}
	
	// peak 와 내리막 검출
	function getSampleFromData2(data, volume) {
		var sample = {};
		var freqLevel = 0;
		var maxFreqIndex = null;
		var maxFreqLevel = 0;
		var afterMaxFreqLevel = 0;
		var peakCount = 0;
		
		// 모든 주파수 데이터를 순회하며
		for (var i in data) {
			afterMaxFreqLevel++;
			
			freqLevel = data[i];
			// 주파수 별 레벨 봉우리(peak)를 찾는다.
			if (freqLevel > maxFreqLevel &&
				freqLevel > opt.minCheckLevel) {
				maxFreqIndex = i;
				maxFreqLevel = freqLevel;
				afterMaxFreqLevel = 0;
			}
			
			// 봉우리가 한동안 갱신되지 않으면 진짜 봉우리로 인정
			if (maxFreqLevel > opt.minCheckLevel &&
				afterMaxFreqLevel > opt.peakEndingCheck) {
				sample[maxFreqIndex] = maxFreqLevel;
				peakCount++;
				maxFreqIndex = null;
				maxFreqLevel = 0;
			}
		}
		
		if (peakCount == 0) {
			sample = null;;
		} else {
			sample.size = peakCount;
			sample.volume = volume;
			sample.type = "sample";
		}
		return sample;
	}
	
	// peak/valley 검출
	function getSampleFromData3(data, volume) {
		var sample = {};
		var freqLevel = 0;
		var maxFreqIndex = null;
		var maxFreqLevel = 0;
		var minFreqIndex = null;
		var minFreqLevel = 255;
		var afterTurnFreqLevel = 0;
		var peakValleyCount = 0;	// peak + valley count
		
		var freqQueue = [];
		var freqSum = 0;
		for (var i = 0; i < opt.avgRange; i++) {
			freqQueue.push(0);
		}
		
		var findPeak = true;	// 봉우리를 찾는가? false: 계곡을 찾는가?
		
		// 모든 주파수 데이터를 순회하며
		for (var i in data) {
			afterTurnFreqLevel++;
			
			freqLevel = data[i];
			
			if (findPeak) {
				// 주파수 별 레벨 봉우리(peak)를 찾는다.
				if (freqLevel > maxFreqLevel &&
					freqLevel > opt.minCheckLevel) {
					maxFreqIndex = i;
					maxFreqLevel = freqLevel;
					afterTurnFreqLevel = 0;
				}
				
				// 봉우리가 한동안 갱신되지 않으면 진짜 봉우리로 인정
				if (maxFreqLevel > opt.minCheckLevel &&
					afterTurnFreqLevel > opt.peakEndingCheck) {
					sample[maxFreqIndex] = maxFreqLevel;
					peakValleyCount++;
					findPeak = false;	// 이제부터 계곡을 찾는다.
					minFreqIndex = i;
					minFreqLevel = freqLevel;
					afterTurnFreqLevel = 0;
				}
			} else {	// find valley
				// 주파수 별 레벨 봉우리(peak)를 찾는다.
				if (freqLevel < minFreqLevel &&
					freqLevel > opt.minCheckLevel) {
					minFreqIndex = i;
					minFreqLevel = freqLevel;
					afterTurnFreqLevel = 0;
				}
				
				// 계곡이 한동안 갱신되지 않으면 진짜 계곡으로 인정
				if (minFreqLevel > opt.minCheckLevel &&
					afterTurnFreqLevel > opt.peakEndingCheck) {
					sample[minFreqIndex] = minFreqLevel;
					peakValleyCount++;
					findPeak = true;	// 이제부터 정상을 찾는다.
					maxFreqIndex = i;
					maxFreqLevel = freqLevel;
					afterTurnFreqLevel = 0;
				}
			}
		}
		
		if (peakValleyCount == 0) {
			sample = null;;
		} else {
			sample.size = peakValleyCount;
			sample.volume = volume;
			sample.type = "sample";
		}
		return sample;
	}
	
	// volume level 검출
	function matchSample1(sample, data) {
		var volumeLevel = 0;
		for (var i in data) {
			volumeLevel += data[i];
		}
		
		return (volumeLevel >= sample.volume);
	}
	
	// peak 와 내리막 검출
	function matchSample2(sample, data) {
		
		return false;
	}
	
	// peak/valley 검출
	function matchSample3(sample, data) {
		var volumeLevel = 0;
		for (var i in data) {
			volumeLevel += data[i];
		}
		// 볼륨이 너무 작으면 실패
		// 샘플 크기가 0 이라도 실패
		if (volumeLevel < opt.minMatchingVolumeLevel ||
			!sample ||
			sample.size == 0) {
			return false;
		}

		// normal 값 추출
		var normalLevel = 0;
		for (var i in sample) {
			if (i === "size") break;
			normalLevel += sample[i] - data[i];
		}
		normalLevel /= sample.size;
		
		// 모든 샘플을 순회하며 데이터와의 거리 합산
		var totalDistance = 0;
		var matchCount = 0;
		for (var i in sample) {
			if (i === "size") break;
			// normalization
			freqLevel = sample[i] - normalLevel;
			
			// 주변에서 제일 가까운 데이터와의 거리를 누적
			i = parseInt(i, 10);
			var dataSize = data.length;
			var minFreq = i - opt.matchingFreqTolerance < 0 ? 0 : i - opt.matchingFreqTolerance;
			var maxFreq = i + opt.matchingFreqTolerance + 1 > dataSize ? dataSize : i + opt.matchingFreqTolerance + 1;
			var minDistance = 256;
			for (var j = minFreq; j < maxFreq; j++) {
				var distance = Math.abs(freqLevel - data[j]);
				if (distance < minDistance) {
					minDistance = distance;
				}
			}
			if (minDistance < opt.matchingLevelTolerance) {
				matchCount++;
			}
			totalDistance += minDistance;
		}
		
		// 매치된 정상/계곡의 개수가 충분한가?
		return (matchCount >= sample.size * opt.matchingRate);
	}
	
}

// 설정 기본값을 반환
SoundKeyMatching.createOptions = function() {
	return {
		samplingType: 3, /*
			1: volume level 검출 (사용안함)
			2: peak 와 내리막 검출 (사용안함)
			3: peak/valley 검출 (이걸 사용함)
		*/
		samplingFreq: 5, // doSampling() 호출 주기 (초당 5회) - 샘플링에 영향을 주지 않음. 호출 권장횟수를 의미
		matchingFreq: 5, // doMatching() 호출 주기 (초당 5회) - 매칭에 영향을 주지 않음. 호출 권장횟수를 의미
		minSamplingVolumeLevel: 5000, // 전체 볼륨이 얼만큼 이상일 때 샘플을 추출하는가? (minMatchingVolumeLevel 보다 높은 값을 권장)
		minMatchingVolumeLevel: 2000, // 전체 볼륨이 얼만큼 이상일 때 매칭을 시도하는가? (minSamplingVolumeLevel 보다 낮은 값을 권장)
		// 샘플링
		minCheckLevel: 10,	// 주파수 대역별로 얼마의 level 이 되어야 정상으로 인식하는가?
		peakEndingCheck: 10,	// 주파수 대역이 Max 이후로 몇 번 지나면 한 번의 봉우리가 완료된 것인가?
		highPassRatio: 0.1,	// 최정상을 기준으로 얼마 이하의 정상을 버릴 것인가??
		// 일반
		sampleEndingCheck: 5,	// level 이 Max 이후로 몇 번 지나면 한 번의 샘플링이 완료된 것인가?
		matchingFreqTolerance: 3, // 정상/계곡 마다의 주파수 대역을 좌우로 어디까지 비교해 볼 것인가?
		matchingLevelTolerance: 10, // 정상/계곡 마다의 레벨이 얼만큼 차이가 나도 일치한 것으로 보는가?
		matchingRate: 0.7	// 정상/계곡이 샘플 대비 몇 개나 일치해야 매칭으로 보는가?
	};
}

// 빈 샘플 반환
SoundKeyMatching.createEmptySample = function() {
	return {size: 0, type: "sample"};
}

