(function(window, document) {

var idbSupported = false,
	db;

document.addEventListener('DOMContentLoaded', function() {

    if ('indexedDB' in window) {
        idbSupported = true;
    }

    if (idbSupported) {
        var openRequest = indexedDB.open('messages', 1);

        openRequest.onupgradeneeded = function(e) {
            var thisDB = e.target.result;

            if (!thisDB.objectStoreNames.contains('osMsgStore')) {
                thisDB.createObjectStore('osMsgStore', { autoIncrement: true });
            }
        }

        openRequest.onsuccess = function(e) {
            console.log('Successfully opened indexedDB request');
            db = e.target.result;

            getMessages();

            document.querySelector('#submitButton').addEventListener('click', submitMessage, false);
        }

        openRequest.onerror = function(e) {
            console.log('Error');
            console.dir(e);
        }
    }

}, false);

function submitMessage() {
	var message = document.querySelector('#messageBox').value,
		transaction = db.transaction(['osMsgStore'],'readwrite'),
		store = transaction.objectStore('osMsgStore'),
		processedMsg,
		request;

	processedMsg = {
		message: message,
		created: new Date()
	};

	request = store.add(processedMsg);

	request.onerror = function(e) {
        console.log('Error', e.target.error.name);
    }

    request.onsuccess = function(e) {
    	setMessage(processedMsg);
    }
}

function setMessage(processedMsg) {
	var msgContents,
	    div = document.createElement('div');

	div.className = 'panel panel-default';
	msgContents = '<div class="panel-body">' + processedMsg.message + '</div>';
	div.innerHTML = msgContents;
	messages.insertBefore( div, messages.firstChild );
}

function getMessages() {
	var transaction = db.transaction(['osMsgStore'], 'readonly'),
		objectStore = transaction.objectStore('osMsgStore'),
 		cursor = objectStore.openCursor();

	cursor.onsuccess = function(e) {
		var messages = document.querySelector('#messages'),
	    	res = e.target.result,
	    	msgContents,
	    	div = document.createElement('div');

		div.className = 'panel panel-default';

	    if (res) {
	    	msgContents = '<div class="panel-body">' + res.value.message + '</div>';
	    	div.innerHTML = msgContents;
	    	messages.insertBefore( div, messages.firstChild );

	        res.continue();
	    }
	}
}

})(window, document);