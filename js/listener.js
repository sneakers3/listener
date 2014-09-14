
var listenerApp;

/**
 * Listener App model
 * @class
 */
function ListenerApp() {
	this.soundList = []; // Sound list
	this.currentState = 'stopped'; // 'stopped' | 'running'
	this.history = []; // Alert list
	this.settings = {};
	this.notiSettings = {}; // handles 'ignore 5mins' 
}

/**
 * Sound model
 * @param id
 * @param title
 * @param soundData
 * @param summary
 * @param alertMethods
 * @class
 */
function Sound(id, title, soundData, summary, alertMethods) {
	this.id = id;
	this.title = title;
	this.soundData = soundData;
	this.summary = summary;
	this.alertMethods = alertMethods; // ('flash' | 'vibrate') set
}

/**
 * Alert model
 * @param soundID
 * @param timestamp
 * @class
 */
function Alert(soundID, timestamp) {
	this.soundID = soundID;
	this.timestamp = timestamp;
}

/**
 * Handler for new alert
 * @param alert
 */
function onNewAlert(alert) {
	// TODO
}

/**
 * 
 * @returns {Number}
 */
function generateNewSoundID() {
	var maxid = 0;
	for(var i in listenerApp.soundList) {
		var sound = listenerApp.soundList[i];
		maxid = (sound.id > maxid) ? sound.id : maxid; 
	}
	return maxid + 1;
}

/**
 * Analyze sound data and return summary
 * @param soundData
 * @returns {String}
 */
function summarizeSound(soundData) {
	// TODO 
	return '';
}

/**
 * Add new sound
 * @param title
 * @param soundData
 * @returns {Sound}
 */
function addNewSound(title, soundData) {
	console.log('addNewSound');
	var newid = generateNewSoundID();
	var summary = summarizeSound(soundData);
	var newSound = new Sound(newid, title, soundData, summary, ['flash', 'vibrate']);  
	listenerApp.soundList.push(newSound);
	return newSound;
}

/**
 * Change sound properties
 */
function changeSound() {
	// TODO
}

/**
 * Start listening
 */
function start() {
	// TODO
}

/**
 * Stop listening
 */
function stop() {
	// TODO
}

/**
 * load saved sounds and settings
 */
function load() {
	// TODO
}

/**
 * save sounds and settings
 */
function save() {
	// TODO
}

/**
 * Initialize app
 */
function initApp() {
	console.log('init');
	listenerApp = new ListenerApp();
	load();
	init_Audio();
}

app.onload = function () {
	console.log('app onload');
	initApp();
};


/**
 * Initialize for html5 audio
 */
function init_Audio() {
    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );

    window.requestAnimFrame = ( function() { 
        return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
                function(callback, element) { 
                    window.setTimeout(callback, 1000 / 60);
                };
    })();
        
    window.AudioContext = ( function() { return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext; } )();
}
