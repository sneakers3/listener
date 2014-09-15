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

/**
 * Notification wrapper
 */
function notification(msg) {
    try {
        if ( isDevice() == true ) {
            var notificationDict = {
                    content : msg,
                    iconPath : "images/image1.jpg", // FIXME
                    soundPath : "music/Over the horizon.mp3", // FIXME
                    vibration : true,
                    ledColor : "#FFFF00", 
                    ledOnPeriod: 1000,
                    ledOffPeriod : 500 };

            var notification = new tizen.StatusNotification("SIMPLE", "Listener notification", notificationDict);
            tizen.notification.post(notification);
        } else {
            // FIXME
            alert("Listener Notification: " + msg);
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
            timeID = setInterval( function() { require('ripple/ui/plugins/goodVibrations').shakeDevice(4); }, 500);
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

