var listenerApp;

function ListenerApp() {
	this.soundList = []; // Sound list
	this.currentState = 'stopped'; // 'stopped' | 'running'
	this.history = []; // Alert list
	this.settings = {};
	this.notiSettings = {}; // handles 'ignore 5mins' 
}

function Sound(id, title, soundData, summary, alertMethods) {
	this.id = id;
	this.title = title;
	this.soundData = soundData;
	this.summary = summary;
	this.alertMethods = alertMethods; // ('flash' | 'vibrate') set
}

function Alert(soundID, timestamp) {
	this.soundID = soundID;
	this.timestamp = timestamp;
}

function onNewAlert() {
	
}

function addNewSound() {
	
}

function editSound() {
	
}

function runListening() {
	
}

function stopListening() {
	
}


function load() {
	// TODO: load saved sounds and settings
}
function init() {
	listnerApp = new ListenerApp();
	load();
}