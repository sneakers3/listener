function SoundKeyMatching(options) {
	var samplingHandler = function() {};	// 샘플을 추출했을 때 알려줄 핸들러
	var debugHandler = function(message) {};	// 디버그 메시지를 출력
	var samplingFunction = null;
	var matchingFunction = null;
	var matchingData = [];	// 비교가 필요한 데이터들과 매칭결과를 알려줄 핸들러들
	var opt = applyOption(options);
		
	var info = {
		volumeLevel: 0,	// 현재 전체 볼륨 레벨
		maxLevel: 0,	// 최대 level
		afterMaxLevel: 0,	// 최대 level 이후 몇 번의 주기가 지났는가?
		sampleCount: 0,	// 샘플 추출 횟수
	};
	var maxLevelSampleData = null;	// 최대 level 일 때의 샘플링 데이터
	
	// call periodically while do sampling
	// 반복적으로 호출해줘야 함 (초당 5~10회 추천)
	this.doSampling = function(data) {
		info.afterMaxLevel++;

		// 볼륨 크기를 구해서
		info.volumeLevel = 0;
		for (var i in data) {
			info.volumeLevel += data[i];
		}
		if (info.volumeLevel > opt.minSamplingVolumeLevel &&
			info.volumeLevel > info.maxLevel) {
			info.maxLevel = info.volumeLevel;
			info.afterMaxLevel = 0;
			maxLevelSampleData = samplingFunction(data);
		}
		
		// 최대 level 이 한동안 갱신되지 않는다면 샘플이 완료된 것으로 간주하고 추출
		if (info.afterMaxLevel > opt.sampleEndingCheck &&
			info.maxLevel > opt.minSamplingVolumeLevel) {
			this.samplingHandler(maxLevelSampleData);
			info.sampleCount++;
			info.maxLevel = 0;
			maxLevelSampleData = null;
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
	
	// volume level 검출
	function getSampleFromData1(data) {
		var sample = {};
		var volumeLevel = 0;
		for (var i in data) {
			volumeLevel += data[i];
		}
		sample.volume = volumeLevel;
		return sample;
	}
	
	// peak 와 내리막 검출
	function getSampleFromData2(data) {
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
				freqLevel > opt.minPeakLevel) {
				maxFreqIndex = i;
				maxFreqLevel = freqLevel;
				afterMaxFreqLevel = 0;
			}
			
			// 봉우리가 한동안 갱신되지 않으면 진짜 봉우리로 인정
			if (maxFreqLevel > opt.minPeakLevel &&
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
		}
		return sample;
	}
	
	// 이동평균 peak 검출
	function getSampleFromData3(data) {
		var sample = {};
		var freqLevel = 0;
		var maxFreqIndex = null;
		var maxFreqLevel = 0;
		var afterMaxFreqLevel = 0;
		var peakCount = 0;
		
		var freqQueue = [];
		var freqSum = 0;
		for (var i = 0; i < opt.avgRange; i++) {
			freqQueue.push(0);
		}
		
		// 모든 주파수 데이터를 순회하며
		for (var i in data) {
			afterMaxFreqLevel++;
			
			freqLevel = data[i];
			// 주파수 별 레벨 봉우리(peak)를 찾는다.
			if (freqLevel > maxFreqLevel &&
				freqLevel > opt.minPeakLevel) {
				maxFreqIndex = i;
				maxFreqLevel = freqLevel;
				afterMaxFreqLevel = 0;
			}
			
			// 봉우리가 한동안 갱신되지 않으면 진짜 봉우리로 인정
			if (maxFreqLevel > opt.minPeakLevel &&
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
	
	// 이동평균 peak 검출
	function matchSample3(sample, data) {
		return false;
	}
	
}

// 설정 기본값을 반환
SoundKeyMatching.createOptions = function() {
	return {
		samplingType: 1, /*
			1: volume level 검출 (테스트용)
			2: peak 와 내리막 검출 (별로임)
			3: 이동평균 peak 검출
		*/
		samplingFreq: 5, // doSampling() 호출 주기 (초당 5회) - 샘플링에 영향을 주지 않음. 호출 권장횟수를 의미
		matchingFreq: 5, // doMatching() 호출 주기 (초당 5회) - 매칭에 영향을 주지 않음. 호출 권장횟수를 의미
		minSamplingVolumeLevel: 10000, // 전체 볼륨이 얼만큼 이상일 때 샘플을 추출하는가? (minMatchingVolumeLevel 보다 높은 값을 권장)
		minMatchingVolumeLevel: 5000, // 전체 볼륨이 얼만큼 이상일 때 매칭을 시도하는가? (minSamplingVolumeLevel 보다 낮은 값을 권장)
		// 내리막 따라가기
		minPeakLevel: 10,	// 주파수 대역별로 얼마의 level 이 되어야 정상으로 인식하는가?
		peakEndingCheck: 20,	// 주파수 대역이 Max 이후로 몇 번 지나면 한 번의 봉우리가 완료된 것인가?
		// 정상 찾기
		avgRange: 5,	// 얼만큼의 주파수 대역을 평균내서 정상/계곡을 찾을 것인가? (1 보다 커야 함)
		
		// 일반
		sampleEndingCheck: 5,	// level 이 Max 이후로 몇 번 지나면 한 번의 샘플링이 완료된 것인가?
		//useVallyMatching: false,	// 계곡도 매칭에 포함시킬 것인가?
		matchingFreqTolerance: 5, // 정상/계곡 마다의 주파수 대역이 얼만큼 차이가 나도 일치한 것으로 보는가?
		matchingRate: 0.7	// 정상/계곡이 샘플 대비 몇 개나 일치해야 매칭으로 보는가?
	};
}

// 빈 샘플 반환
SoundKeyMatching.createEmptySample = function() {
	return {size: 0};
}

