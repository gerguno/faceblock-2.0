getToggleValue(function(switcher){
	falseAllHinted();
	toggleProgram(switcher);
});



function toggleProgram(tvalue) {

	(tvalue) ? programOn() : programOff();

	function programOn() {
			console.log('Faceblock is on');

			var counter = 0,
				countedValue = [];

			function getAllElementsWithAttribute(attribute, value) {
			  var matchingElements = [];
			  var allElements = document.querySelectorAll('div');
			  for (var i = 0, n = allElements.length; i < n; i++) {
			    if (allElements[i].getAttribute(attribute) === value) {
			      // Element exists with attribute. Add to array.
			      matchingElements.push(allElements[i]);
			    }
			  }
			  return matchingElements;
			}

			function capitalizeFirstLetter(string) {
			    return string.charAt(0).toUpperCase() + string.slice(1);
			}

			function lowerizeFirstLetter(string) {
			    return string.charAt(0).toLowerCase() + string.slice(1);
			}

			function getPosts() {
				var posts = getAllElementsWithAttribute("data-testid", "fbfeed_story");
				if (posts.length === 0) {
					posts = document.querySelectorAll('._5jmm');
					if (posts.length === 0) {
						posts = 0;
						return posts;
					}
					return posts;
				}
				return posts;
			}

			function removePosts(keyword, callback) {
					counter = 0;
					var fbPosts = getPosts();
					for (i = 0; i < fbPosts.length; i++) {
						if (fbPosts[i].innerHTML.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
							fbPosts[i].remove();
							counter++;
						}
					}
					callback(counter);					
			}	
				
			function cleanFeed() {
					chrome.storage.sync.get("todo", function (keys){ 
						if (keys.todo != null) {
								for (var l = 0; l < keys.todo.length; l++) {
										removePosts(keys.todo[l]['content'], function(counter) {
											if (counter > 0) {	
												todocopy = keys.todo;

												// Set counter
												todocopy[l]['counter'] += counter;

												// Set hinted
												todocopy[l]['hinted'] = true; 

												//for debugging
												removeName = todocopy[l]['content'];
												hinted = todocopy[l]['hinted'];

												// Save counter and hinted
												chrome.storage.sync.set({ todo: todocopy });

												// Remove hinted
												removeHinted(todocopy,l);

												function removeHinted(array,l) {
							                        setTimeout(function() {
							                        	var hintedarr = array;
							                        	hintedarr[l]['hinted'] = false;
							                            chrome.storage.sync.set({ todo: hintedarr });							                   
							                        }, 1000);
							                    }

											}
										});
								}	
						}		
					});
			}	

			function cleanPermanent() {
				var postsQ1 = getPosts();
				setTimeout(function checkNKill() {
					var postsQ2 = getPosts();
							if (postsQ2.length === postsQ1.length) {
								getToggleValue(function(switcher) {
									if (switcher) setTimeout(checkNKill, 2000);
								});
							} else {
								getToggleValue(function(switcher) {
									if (switcher) {
										cleanFeed();
										postsQ1 = postsQ2;
										setTimeout(checkNKill, 2000);
									}
								});
							}
				}, 2000);
			}

			cleanFeed();
			cleanPermanent();

	}	

	function programOff() {
		console.log('Faceblock is off');
 
	}
}	

function getToggleValue(callback) {
	chrome.storage.sync.get('switcher', function(keys) {  
        var toggleValue = keys.switcher;
        callback(toggleValue);
    });
}

function falseAllHinted() {
	chrome.storage.sync.get("todo", function (keys){ 
		todocopy = keys.todo;
		for (i = 0; i < todocopy.length; i++) {
			todocopy[i]['hinted'] = false;
		}
		chrome.storage.sync.set({ todo: todocopy });
	});
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "switcher-toggle":
			getToggleValue(function(switcher){
				toggleProgram(switcher);
    		});
		break;
	}
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "clean":
			getToggleValue(function(switcher){
				toggleProgram(switcher);
    		});
		break;
	}
});


