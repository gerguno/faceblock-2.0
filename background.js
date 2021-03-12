// listening for an event / one-time requests
// coming from the popup

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "switcher-toggle":
            toggleSwitcher();
        break;
    }
    return true;
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "clean":
            clean();
        break;
    }
    return true;
});


// send a message to the content script
var toggleSwitcher = function(value) {
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.sendMessage(tab.id, {type: "switcher-toggle" });
	});
}

var clean = function(value) {
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.sendMessage(tab.id, {type: "clean" });
	});
}


// Make Badge Counter
getCount(function(count) {
    chrome.browserAction.setBadgeBackgroundColor({ color: [95, 95, 95, 255] });
    if (count > 0) {
        chrome.browserAction.setBadgeText({text: count});
    } else {
        chrome.browserAction.setBadgeText({text: ""});
    }
});

// Change Counter on Counter Change
chrome.storage.onChanged.addListener(function(changes, areaName) {
    getCount(function(count) {
        if (count > 0) {
            chrome.browserAction.setBadgeText({text: count});
        } else {
            chrome.browserAction.setBadgeText({text: ""});
        }
    });
});

function getCount(callback) {      
    chrome.storage.sync.get("face", function (keys){
        var count = 0; 
        if (keys.face != null) {
            for (i = 0; i < keys.face.length; i++) {
                count += keys.face[i]['counter'];
            }
        }    
        callback(count.toString());
    });   
}

//for Google Analytics
_gaq.push(['_trackPageview']); 