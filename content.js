'use strict';

class App {
	constructor() {
		this.switcher = false
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
		this.removePosts()
		this.updatePosts()
	}

	updatePosts() {
		const targetNode = document.querySelector('[role="feed"]');
		const callback = (mutationsList) => {
			for (let mutation of mutationsList) {
				if (mutation.addedNodes.length > 0) {
					if (mutation.addedNodes[0].attributes[0].name === "data-pagelet") {
						this.posts.push(mutation.addedNodes[0])
						console.log(this.posts)
						this.removePosts()
					}
				}
			}
		}
		const observer = new MutationObserver(callback);
		observer.observe(targetNode, { attributes: true, childList: true, subtree: false });
	}

	removeByKey(keyword, callback) {
		let counter = 0;
		this.posts.map((p, index) => {
			if (p.innerHTML.toLowerCase().includes(keyword)) {
				p.remove()
				this.posts.splice(index, 1)
				// console.log('DELETED!!!!!!!!!!!!!!!!')
				counter++
			}
		})
		callback(counter);
	}

	removePosts() {
		chrome.storage.sync.get("todo", keys => {
			if (keys.todo != null) {
				keys.todo.map((t, i) => {
					this.removeByKey(t['content'], counter => {
						if (counter > 0) {
							let todocopy = keys.todo;
							todocopy[i]['counter'] += counter;

							const colors = ['#CEB4B4', '#CFD0C1', '#9E96F9', '#E8A17A', '#BBBDC8', '#F5D86F', '#BAAEA0', '#8CB8C6', '#C7ACEA']
							if (todocopy[i]['color'] === '#F7F8FB') {
								(function setColor() {
									todocopy[i]['color'] = colors[Math.floor(Math.random() * colors.length)];
									if (todocopy[i-1]) {
										if (todocopy[i]['color'] === todocopy[i-1]['color']) {
											setColor();
										} else {
											if (todocopy[i-2]) {
												if (todocopy[i]['color'] === todocopy[i-2]['color']) {
													setColor();
												} else {
													if (todocopy[i-3]) {
														if (todocopy[i]['color'] === todocopy[i-3]['color']) {
															setColor();
														}
													}
												}
											}
										}
									}
								})();
							}
							todocopy[i]['trashesCounter'] = todocopy[i]['trashesCounter'].concat(new Array(counter));
							chrome.storage.sync.set({ todo: todocopy });
						}
					})
				})
			}
		})
	}

	start() {
		this.getSwitcher()
	}
}

let Faceblock = new App()
Faceblock.start()


chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "switcher-toggle":
			Faceblock.start()
		break;
	}
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "clean":
			Faceblock.start()
		break;
	}
});

