/*******************************************************************************
* This file was generated by Tizen Web UI Builder.
* User should hand edit this file.
********************************************************************************/

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.okButton_ontap = function(event) {
	console.log('ok button tap');
	console.log('sound title:' + this.soundTitle.val());
	addNewSound(this.soundTitle.val(), '');
	pageManager.changePage('list', {});
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.cancelButton_ontap = function(event) {
	console.log('cancel button tap');
};

/**
 * @param {Object} event
 * @base _newsound_page
 * @returns {Boolean}
*/
_newsound_page.prototype.recordButton_ontap = function(event) {
	console.log('record button tap');
};
