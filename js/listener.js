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
    this.alertListeners = [];
}

/**
 * Sound model
 * @param id
 * @param title
 * @param soundData
 * @param samplePackage
 * @param alertMethods
 * @class
 */
function Sound(id, title, soundData, samplePackage, alertMethods) {
    this.id = id;
    this.title = title;
    this.soundData = soundData;
    this.samplePackage = samplePackage;
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
    for (var i in listenerApp.alertListeners) {
        var l = listenserApp.alertListeners[i];
        l(alert);
    }
}

function addAlertListener(alertListener) {
    listenerApp.alertListeners.push(alertListener);
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
 * Add new sound
 * @param title
 * @param soundData
 * @returns {Sound}
 */
function addNewSound(title, soundData, samplePackage) {
    console.log('addNewSound');
    var newid = generateNewSoundID();
    var newSound = new Sound(newid, title, soundData, samplePackage, ['flash', 'vibrate']);  
    listenerApp.soundList.push(newSound);
    return newSound;
}

function getSoundByID(soundID) {
	for (var i in listenerApp.soundList ) {
		var sound = listenerApp.soundList[i];
		if (sound.id == soundID) {
			return sound;
		}
	}
	return null;
}

/**
 * Change sound properties
 */
function changeSound(soundID, soundObject) {
	var sound = getSoundByID(soundID);
	console.log('changeSound', sound, soundObject);
	if (!sound) {
		console.error('changeSound soundID not found:', soundID);
		return false;
	}
	if (soundObject.title) {
		sound.title = soundObject.title;
	}
	if (soundObject.soundData) {
		sound.title = soundObject.soundData;
	}
	if (soundObject.samplePackage) {
		sound.title = soundObject.samplePackage;
	}
	return true;
}

/**
 * Start listening
 */
function start() {
    // TODO
    console.log('start');
    listenerApp.currentState = 'running';
}

/**
 * Stop listening
 */
function stop() {
    // TODO
    console.log('stop');
    listenerApp.currentState = 'stopped';
}

/**
 * load saved sounds and settings
 */
function load() {
    // TODO
    console.log('load');
}

/**
 * save sounds and settings
 */
function save() {
    // TODO
    console.log('save');
}

/**
 * Initialize app
 */
function initApp() {
    console.log('init');
    listenerApp = new ListenerApp();
    load();
    init_Matcher();
}

app.onload = function () {
    console.log('app onload');
    initApp();
};

/**
 * Initialize for Matcher
 */
var matcher;
function init_Matcher() {
    matcher = new Matcher();
}

/**
 * Notification wrapper
 * 
 * notification {
 *     id,
 *  message,
 *  vibration,
 *  ledColor,
 * }
 */
function notification(noti) {
    try {
        if ( isDevice() == true ) {
            var notificationDict = {
                    content : noti.message,
                    iconPath : "../res/warning.png",
                    soundPath : "",
                    vibration : noti.vibration, // true,
                    ledColor : noti.ledColor,   // "#FFFF00", 
                    ledOnPeriod: 1000,
                    ledOffPeriod : 500 };

            var notification = new tizen.StatusNotification("SIMPLE", "Listener", notificationDict);
            tizen.notification.post(notification);
        } else {
            var notification = '<div data-role="notification" id="'+ noti.id + '" data-type="ticker"><img src="../res/warning.png"><p>' + noti.message + '</p></div>';
            $('#history').append(notification);

            $('#'+noti.id).notification().on("click", function() { 
                    $('#'+noti.id).remove();
                    // FIXME: vibration and flash
                    if ( noti.vibration == true ) {
                        vibrate(false);
                    }
                });
            $('#'+noti.id).notification('open');
            if ( noti.vibration == true ) {
                vibrate(true);
            }
        }
    } catch (e) {
        console.log (e.name + ": " + e.message);
    }
}

/**
 * Trigger for vibrate
 * 
 * @see http://www.w3.org/TR/2012/WD-vibration-20120202/
 */
var timeID = null;
function vibrate(flag) {
    if ( isDevice() == true ) {
        if ( flag == true ) {
            if ( timeID != null ) {
                clearInterval(timeID);
                timeID = null;
            }
            timeID = setInterval( function() { navigator.vibrate(1000); }, 1000);
            console.log('device vibrate on');
        } else {
            if ( timeID != null ) {
                clearInterval(timeID);
                timeID = null;
            }
            navigator.vibrate(0);
            console.log('device vibrate off');
        }
    } else {
        if ( flag == true ) {
            if ( timeID != null ) {
                clearInterval(timeID);
                timeID = null;
            }
            timeID = setInterval( function() { parent.require('ripple/ui/plugins/goodVibrations').shakeDevice(4); }, 500);
            console.log('simulator vibrate on');
        } else {
            if ( timeID != null ) {
                clearInterval(timeID);
                timeID = null;
            }
            console.log('simulator vibrate off');
        }
    }
}

/**
 * Trigger for flash
 */
var flashID = null;
function flash(flag) {
    if ( isDevice() == true ) {
        // TODO
    } else {
         if ( flag == true ) {
             if ( flashID != null ) {
                 clearInterval(flashID);
                 flashID = null;
             }
             flashID = setInterval( function() { 
                 setTimeout(function() {document.body.style.backgroundColor="#FF5050"; } ,1);
                 setTimeout(function() {document.body.style.backgroundColor="#fff"; } ,500);
             }, 800);
             console.log('simulator flash on');
         } else {
             if ( flashID != null ) {
                 clearInterval(flashID);
                 flashID = null;
             }
             console.log('simulator flash off');
         }
     }
}

/**
 * Check for target
 */
function isDevice() {
    try {
        if ( tizen instanceof Object ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}


//FIXME
///**
//* Initialize for html5 audio
//*/
//function init_Audio() {
//  navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
//
//  window.requestAnimFrame = ( function() { 
//      return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
//              function(callback, element) { 
//                  window.setTimeout(callback, 1000 / 60);
//              };
//  })();
//
//  window.AudioContext = ( function() { return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext; } )();
//}
