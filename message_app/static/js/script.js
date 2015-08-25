(function(window, document) {

var idbSupported = false,
	db,
    inputs = document.querySelectorAll('input[type="text"], input[type="password"]');

activate();

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

            if (document.querySelector('#messages')) {
                getMessages();
            }

            if (document.querySelector('#submitButton')) {
                document.querySelector('#submitButton').addEventListener('click', submitMessage, false);
            }
        }

        openRequest.onerror = function(e) {
            console.log('Error');
            console.dir(e);
        }
    }

    document.querySelector('body').addEventListener('click', function(event) {
        if (event.target.className.toLowerCase() === 'delete close') {
            deleteMessage(event.target);
        }
    });

}, false);

function activate() {
    for (i = 0; i < inputs.length; ++i) {
        inputs[i].addEventListener('keyup', function(event) {
            removeValidation(event.target);
        });
    }
}

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
	generateMessage(null, processedMsg.created, processedMsg.message)
}

function getMessages() {
	var transaction = db.transaction(['osMsgStore'], 'readonly'),
		objectStore = transaction.objectStore('osMsgStore'),
 		cursor = objectStore.openCursor(),
        isAdmin = document.getElementsByTagName('body')[0].className === 'admin' ? true : false;

	cursor.onsuccess = function(e) {
        var res = e.target.result;

	    if (res) {
            generateMessage(res.key, res.value.created, res.value.message, isAdmin);
	        res.continue();
	    }
	}
}

function generateMessage(key, created, message, isAdmin) {
    var messages = document.querySelector('#messages'),
        div = document.createElement('div'),
        monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        day = created.getDate(),
        monthIndex = created.getMonth(),
        year = created.getFullYear(),
        hours = created.getHours(),
        mins = created.getMinutes() < 10 ? '0' + created.getMinutes() : created.getMinutes(),
        msgContents = '<div class="panel-heading"><span class="text-muted">' + day + '.' + (monthIndex + 1) + '.' + year + ' ' + hours + ':' + mins + '</span></div><div class="panel-body" data-key="' + key + '">';

    div.className = 'panel panel-default';

    if (isAdmin) {
        msgContents += '<button type="button" class="delete close">&times;</button>';
    }
    msgContents += message.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</div>';

    div.innerHTML = msgContents;
    messages.insertBefore( div, messages.firstChild );
}

function deleteMessage(target) {
    var parent = target.parentNode,
        key = parseInt(parent.dataset.key),
        panel = parent.parentNode,
        transaction = db.transaction(['osMsgStore'], 'readwrite'),
        request = transaction.objectStore('osMsgStore').delete(key);

    transaction.oncomplete = function(event) {
        panel.remove();
    };
    return false;
}

function removeValidation(el) {
    if (el.nextSibling) {
        el.nextSibling.remove();
        el.parentNode.className = el.parentNode.className.replace(' has-error', '');
    }
}

// HELPER FUNCTIONS
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

})(window, document);