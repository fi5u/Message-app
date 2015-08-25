(function(window, document) {

    var idbSupported = false,
    	db,
        inputs = document.querySelectorAll('input[type="text"], input[type="password"]');

    // Action for first load
    activate();


    // Functions to call on first load
    function activate() {
        // Set up the browser-based db
        dbSetup();
        addValidationListeners();
    }


    // Checks for support for IndexedDB and instantiates it if possible
    function dbSetup() {
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
    }


    // Called when user submits a message on the home page
    function submitMessage() {
    	var message = document.querySelector('#messageBox').value,
    		transaction = db.transaction(['osMsgStore'],'readwrite'),
    		store = transaction.objectStore('osMsgStore'),
    		processedMsg,
    		request;

        // Should not submit empty message
        if (message.trim() === '') {
            return false;
        }

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


    // Add the newly-created message to the list
    function setMessage(processedMsg) {
    	generateMessage(null, processedMsg.created, processedMsg.message)
    }


    // Retrieve all saved messages
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


    // Generate an individual message
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

        setTimeout(function() {
            div.className = div.className + ' panel-appear';
        }, 50);
    }


    // Delete an individual message
    function deleteMessage(target) {
        var parent = target.parentNode,
            key = parseInt(parent.dataset.key),
            panel = parent.parentNode,
            panelBody = panel.lastChild,
            transaction = db.transaction(['osMsgStore'], 'readwrite'),
            request,
            text = panelBody.innerText || panelBody.textContent,
            confirmation = confirm('Are you sure you want to delete the message starting with: ' + text.substr(1).substring(0, 5));

        if (!confirmation) {
            return false;
        }

        request = transaction.objectStore('osMsgStore').delete(key);

        transaction.oncomplete = function(event) {
            panel.className = panel.className.replace(' panel-appear', '');
            setTimeout(function() {
                panel.remove();
            }, 1000);
        };
        return false;
    }


    // Add listeners to input fields
    function addValidationListeners() {
        for (i = 0; i < inputs.length; ++i) {
            inputs[i].addEventListener('keyup', function(event) {
                removeValidation(event.target);
            });
        }
    }


    // Remove the validation classes and elements when user input is detected
    function removeValidation(el) {
        if (el.nextSibling) {
            el.nextSibling.remove();
            el.parentNode.className = el.parentNode.className.replace(' has-error', '');
        }
    }



    // HELPER FUNCTIONS

    // Insert after referenced element
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

})(window, document);