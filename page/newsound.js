/*******************************************************************************
* This file was generated by Tizen Web UI Builder.
* User should hand edit this file.
********************************************************************************/
var isRecording = false;
var samplePackage;

function startRecord() {
	matcher.startSampling();
	console.log("matcher.startSampling();");
	isRecording = true;
}

function stopRecord() {
	samplePackage = matcher.stopSampling();
	console.log("matcher.stopSampling();");
	console.log("package received #" + samplePackage.length, samplePackage);
    isRecording = false;
}

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.okButton_ontap = function(event) {
    console.log('ok button tap');
    console.log('sound title:' + this.soundTitle.val());
    var title = this.soundTitle.val();
    if ( title === '' || !samplePackage ) {
    	// FIXME
    	alert("invalid sample: " + title +" : " + samplePackage);
    	return;
    }

    addNewSound(title, '', samplePackage);
    pageManager.changePage('list');
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.cancelButton_ontap = function(event) {
	console.log('cancel button tap');
	pageManager.changePage('list');
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.recordButton_ontap = function(event) {
    console.log('record button tap');

    if ( isRecording == false ) {
        startRecord();
    } else {
        stopRecord();
    }
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.backButton_ontap = function(event) {
	pageManager.changePage('list');
};











// TODO
/*
//Global Variables for Audio
var audioContext;
var analyserNode;
var javascriptNode;
var sampleSize = 1024;  // number of samples to collect before analyzing
                        // decreasing this gives a faster sonogram, increasing it slows it down
var amplitudeArray;     // array to hold frequency data
var audioStream;

// Global Variables for Drawing
var column = 0;
var canvasWidth  = 800;
var canvasHeight = 256;
var ctx;

var samplePackage;
function stopRecord() {
	samplePackage = matcher.stopSampling();
	console.log("matcher.stopSampling();");
	console.log("package received #" + samplePackage.length);
	
	// FIXME
//    javascriptNode.onaudioprocess = null;
//    if(audioStream) {
//        audioStream.stop();
//    }
//    if(sourceNode) {
//        sourceNode.disconnect();
//    }

    isRecording = false;
}

function startRecord() {
	matcher.startSampling();
	console.log("matcher.startSampling();");

	// FIXME
//    ctx = $("#soundCanvas").get()[0].getContext("2d");
//
//    try {
//        audioContext = new AudioContext();
//    } catch(e) {
//        alert('Web Audio API is not supported in this browser');
//    }
//
//    clearCanvas();
//
//    // get the input audio stream and set up the nodes
//    try {
//        navigator.getUserMedia(
//          { video: false,
//            audio: true},
//          setupAudioNodes,
//          onError);
//    } catch (e) {
//        alert('webkitGetUserMedia threw exception :' + e);
//    }

    isRecording = true;
}

function setupAudioNodes( stream ) {
    // create the media stream from the audio input source (microphone)
    sourceNode = audioContext.createMediaStreamSource(stream);

    audioStream = stream;

    analyserNode   = audioContext.createAnalyser();

    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    //amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // setup the event handler that is triggered every time enough samples have been collected
    // trigger the audio analysis and draw one column in the display based on the results
    javascriptNode.onaudioprocess = function () {
        amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(amplitudeArray);
        // draw one column of the display
        requestAnimFrame(drawTimeDomain);
    }

    // Now connect the nodes together
    // Do not connect source node to destination - to avoid feedback
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
}

function onError(e) {
    console.log(e);
}

function drawTimeDomain() {
    var minValue = 9999999;
    var maxValue = 0;

    for ( var i = 0; i < amplitudeArray.length; i++ ) {
        var value = amplitudeArray[i] / 256;
        if( value > maxValue ) {
            maxValue = value;
        } else if ( value < minValue ) {
            minValue = value;
        }
    }

    var y_lo = canvasHeight - (canvasHeight * minValue) - 1;
    var y_hi = canvasHeight - (canvasHeight * maxValue) - 1;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(column,y_lo, 1, y_hi - y_lo);

    // loop around the canvas when we reach the end
    column += 1;
    if( column >= canvasWidth ) {
        column = 0;
        clearCanvas();
    }
}

function clearCanvas() {
    column = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // ctx.beginPath();
    ctx.strokeStyle = '#f00';
    var y = (canvasHeight / 2) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth-1, y);
    ctx.stroke();
}
*/
/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.onpageinit = function(event) {
	samplePackage = null;
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.onpageshow = function(event) {
	// set default title generated from new sound id
	var newSoundID = generateNewSoundID();
	var defaultTitle = 'Sound Sample #' + newSoundID;
	this.soundTitle.val(defaultTitle);
	this.soundTitle.focus();
};

