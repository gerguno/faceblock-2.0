getToggleValue(function(switcher){
	falseAllHinted();
	toggleProgram(switcher);
});

function toggleProgram(tvalue) {

	(tvalue) ? programOn() : programOff();

	function programOn() {
			console.log('Faceblock is on');

			var counter = 0,
				countedValue = [],
				colors = ['#CEB4B4', '#CFD0C1', '#9E96F9', '#E8A17A', '#BBBDC8', '#F5D86F', '#BAAEA0', '#8CB8C6', '#C7ACEA'];

			function capitalizeFirstLetter(string) {
			    return string.charAt(0).toUpperCase() + string.slice(1);
			}

			function lowerizeFirstLetter(string) {
			    return string.charAt(0).toLowerCase() + string.slice(1);
			}

			function getPosts() {
				var posts = document.querySelectorAll('[data-pagelet^="FeedUnit"]');
				if (posts.length === 0) {
					posts = document.querySelectorAll('.du4w35lb');
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

												// Update counter
												todocopy[l]['counter'] += counter;

												// // Set color step-by-step
												// todocopy[l]['color'] = colors[colorsCounter];
												// window.colorsCounter += 1;


												// Set color random
												if (todocopy[l]['color'] == '#F7F8FB') {
													(function setColor() {
														todocopy[l]['color'] = colors[Math.floor(Math.random() * colors.length)];

														// Avoid color tautologies
														if (todocopy[l-1]) {
															if (todocopy[l]['color'] == todocopy[l-1]['color']) {
																setColor();
															} else {
																if (todocopy[l-2]) {
																	if (todocopy[l]['color'] == todocopy[l-2]['color']) {
																		setColor();
																	} else {
																		if (todocopy[l-3]) {
																			if (todocopy[l]['color'] == todocopy[l-3]['color']) {
																				setColor();
																			}
																		}
																	}		
																}	
															} 
														}
													})();
												}

												// Update trashesCounter
												todocopy[l]['trashesCounter'] = todocopy[l]['trashesCounter'].concat(new Array(counter));

												// SAVE TO STORAGE
												chrome.storage.sync.set({ todo: todocopy });
												console.log(todocopy);
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
				console.log(switcher);
    		});
		break;
	}
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "clean":
			getToggleValue(function(switcher){
				toggleProgram(switcher);
				console.log(switcher);
    		});
		break;
	}
});


