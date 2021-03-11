'use strict';

class App {
	constructor() {
		this.switcher = false
		this.counter = 0
		this.colors = ['#CEB4B4', '#CFD0C1', '#9E96F9', '#E8A17A', '#BBBDC8', '#F5D86F', '#BAAEA0', '#8CB8C6', '#C7ACEA']
		this.posts = []
	}

	getSwitcher() {
		chrome.storage.sync.get('switcher', keys => {
			this.switcher = keys.switcher
			this.switcher ? this.programOn() : this.programOff()
		})
	}

	programOn() {
		console.log('Faceblock is on ;)')
		this.getInitialPosts()
	}

	programOff() {
		console.log('Faceblock is off ;)')
	}

	getInitialPosts() {
		let posts = document.querySelectorAll('[data-pagelet^=FeedUnit]');
		this.posts = [...posts];
		this.updatePosts()
	}

	updatePosts() {
		const targetNode = document.querySelector('[role="feed"]');
		const callback = (mutationsList) => {
			for (let mutation of mutationsList) {
				if (mutation.addedNodes.length > 0) {
					if (mutation.addedNodes[0].attributes[0].name === "data-pagelet") {
						// console.log(mutation.addedNodes)
						this.posts.push(mutation.addedNodes[0])
						console.log(this.posts)
						console.log('+')
						// console.log(mutation.addedNodes[0])
					}
				}
			}
		}
		// Create an observer instance linked to the callback function
		const observer = new MutationObserver(callback);
		// Start observing the target node for configured mutations
		observer.observe(targetNode, { attributes: true, childList: true, subtree: false });
		// Later, you can stop observing
		// observer.disconnect();
	}

	start() {
		this.getSwitcher()
	}
}

let Faceblock = new App()
Faceblock.start()


getToggleValue(function(switcher){
	falseAllHinted();
	toggleProgram(switcher);
});

function getToggleValue(callback) {
	chrome.storage.sync.get('switcher', function(keys) {
		const toggleValue = keys.switcher;
		callback(toggleValue);
	});
}

function toggleProgram(tvalue) {

	(tvalue) ? programOn() : programOff();

	function programOn() {
			console.log('Faceblock is on');

			let counter = 0,
				countedValue = [],
				colors = ['#CEB4B4', '#CFD0C1', '#9E96F9', '#E8A17A', '#BBBDC8', '#F5D86F', '#BAAEA0', '#8CB8C6', '#C7ACEA'];

			function getPosts() {
				let posts = document.querySelectorAll('[data-pagelet^="FeedUnit"]');
				if (posts.length === 0) {
					posts = document.querySelectorAll('.du4w35lb');
					if (posts.length === 0) {
						posts = 0;
						// console.log(posts)
						return posts;
					}
					// console.log(posts)
					return posts;
				}
				// console.log(posts)
				return posts;
			}

			function removePosts(keyword, callback) {
					counter = 0;
					const fbPosts = getPosts();
					for (let i = 0; i < fbPosts.length; i++) {
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
								for (let l = 0; l < keys.todo.length; l++) {
										removePosts(keys.todo[l]['content'], function(counter) {
											if (counter > 0) {	
												let todocopy = keys.todo;

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
				let postsQ1 = getPosts();
				setTimeout(function checkNKill() {
					let postsQ2 = getPosts();
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

function falseAllHinted() {
	chrome.storage.sync.get("todo", function (keys){ 
		let todocopy = keys.todo;
		for (let i = 0; i < todocopy.length; i++) {
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
			Faceblock.start()
		break;
	}
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "clean":
			getToggleValue(function(switcher){
				toggleProgram(switcher);
    		});
			Faceblock.start()
		break;
	}
});

