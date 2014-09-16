/*******************************************************************************
* This file was generated by Tizen Web UI Builder.
* User should hand edit this file.
********************************************************************************/

/**
 * Add new alert to history
 */
function addNewAlert() {
    
}

function historyMatchHandler(event, soundID) {
	console.log('history matchHandler', soundID);
    var noti = {
            id : soundID,
            message : "test" + soundID,
            vibration : true
    }
    notification(noti);
}

/**
 * @param {Object} event
 * @base _history_page
 * @returns {Boolean}
*/
_history_page.prototype.onpagebeforehide = function(event) {
    console.log('history page before hide');
    stop();
    listenerApp.off('soundMatched', historyMatchHandler);
};

/**
 * @param {Object} event
 * @base _history_page
 * @returns {Boolean}
*/
_history_page.prototype.onpagebeforeshow = function(event) {
    console.log('history page before show');
    start();

    listenerApp.on('soundMatched', historyMatchHandler);
};

/**
 * @param {Object} event
 * @base _history_page
 * @returns {Boolean}
*/
_history_page.prototype.backButton_ontap = function(event) {
    pageManager.changePage('list');
};

/**
 * @param {Object} event
 * @base _history_page
 * @returns {Boolean}
*/
_history_page.prototype.trashButton_ontap = function(event) {
    // TODO
};

