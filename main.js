//just yell at the user if they try to run the site without a "modern" browser
if (!document.querySelector || !window.localStorage || !window.addEventListener) {
	alert("Your browser does not support local storage, please try another one.");
}
//The magic comes out of here.
var notes = {
	prependID: "html5notes-",
	section: null,
	//init function, set the element that contains the notes
	init : function(selector) {
		this.section = document.querySelector(selector)
		return this
	},
	//show a single note, or all of them
	show: function() {
		section = this.section;
		prependID = this.prependID;
		//every time this runs, just remove all the content from the container
		section.innerHTML = "";
		//check to see if there are values in local storage
		if (localStorage.length > 0) {
			//am I home?
			if (location.hash === "" || location.hash === "#home") {
				//show all of them
				for (key in localStorage) {
					//make sure the key is a number, won't catch all possible problems but it will get most of them.
					if (key.match(prependID)) {
						//get the local storage key and value
						value = JSON.parse(localStorage.getItem(key));
						//make me a note
						note = document.createElement("li");
						//make the title
						title = document.createElement("h2");
						title.setAttribute("class", "note-title");
						title.textContent = value.note[0].data.title;
						note.appendChild(title);
						note.innerHTML += '<time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '" class="button success view">View</a></li>';
						section.appendChild(note);
						//fade it in
						animate.fade(note, 20);
					}
				}
			} else {
				//okay, I'm just going to show one note
				note = document.createElement("li");
				//check to make sure note exists
				if (location.hash.substring(1) in localStorage && location.hash.substring(1).match(prependID)) {
					//load it in
					id = location.hash.substring(1);
					value = JSON.parse(localStorage.getItem(id));
					//make the title
					title = document.createElement("h2");
					title.setAttribute("class", "note-title");
					title.textContent = value.note[0].data.title;
					note.appendChild(title);
					note.innerHTML += '<time>Created on ' + value.note[0].data.date + ' at ' +value.note[0].data.time + '</time>';
					noteContent = document.createElement("div");
					//render the markdown content
					noteContent.innerHTML = marked(value.note[0].data.note);
					note.appendChild(noteContent);
					//delete the note
					deleteNote = document.createElement("a");
					deleteNote.setAttribute("href", "#");
					deleteNote.setAttribute("class", "button danger");
					deleteNote.textContent = "Delete";
					deleteNote.onclick = function() {
						notes.remove(id);
						return false;
					}
					//edit the note
					editNote = document.createElement("a");
					editNote.setAttribute("href", "#");
					editNote.setAttribute("class", "button success");
					editNote.textContent = "Edit";
					editNote.onclick = function() {
						notes.edit(id);
						return false;
					}
					note.appendChild(editNote);
					note.appendChild(deleteNote);
				} else {
					//404 page
					note.innerHTML = "<h2 class='no-notes'>Looks like that note doesn't exist.</h2> <a href='#home' class='button success'>Go back</a>";
				}
				note.setAttribute("class", "single-note");
				section.appendChild(note);
				animate.fade(note, 20);
			}
		} else {
			//no notes
			note = document.createElement("li");
			note.innerHTML = "<h1 class='no-notes'>Looks like there are no notes. Add some!</h1>";
			section.appendChild(note);
			animate.fade(note, 20);
		}
	},
	//edit function, runs when the user wants to edit a note
	edit: function(id) {
		//get the note I want to edit
		value = JSON.parse(localStorage.getItem(id));
		//set the values of our lovely text areas to the values from local storage
		document.querySelector(".note-title").value = value.note[0].data.title;
		document.querySelector(".note-text").value = value.note[0].data.note;
		//animate the new note section down
		animate.pushDown(document.querySelector(".new-note"), 4);
		//close button (cancel)
		document.querySelector(".close").onclick = function() {
			animate.pushUp(document.querySelector(".new-note"), 4);
			document.querySelector(".note-title").value = "";
			document.querySelector(".note-text").value = "";
			return false;
		}
		//save new note
		document.querySelector(".save-note").onclick = function() {
			noteTitle = document.querySelector(".note-title").value;
			noteText = document.querySelector(".note-text").value;
			if (noteTitle !== "" && noteText !== "") {
				instance.create(noteTitle, noteText, id);
				document.querySelector(".note-title").value = "";
				document.querySelector(".note-text").value = "";
				animate.pushUp(document.querySelector(".new-note"), 4, function() {
					//show a message when I've saved the note
					message.alert("Success! Note saved.");
				});
			} else {
				//give me a message
				message.alert("Error! You need to fill out all the fields.");
			}
		}
	},
	create: function(title, note, id) {
		//if I'm not trying to save an already existent note, make a new ID
		if (typeof(id) === "undefined") {
			//make me an id
			num = localStorage.length;
			id = this.prependID + num;
			//the just in case thing
			while (id in localStorage) {
				num += 1;
				id = this.prependID + num;
			}
			//if I'm making a new item, I want to go to the home page
			page = "#home";
		} else {
			//if I'm editing a current item, I just want to reload that item
			page = "#" + id;
		}
		//get the date and time
		currentTime = new Date()
		month = currentTime.getMonth() + 1;
		day = currentTime.getDate();
		year = currentTime.getFullYear();
		hours = currentTime.getHours();
		minutes = currentTime.getMinutes();
		//some nice conversion
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (hours >= 12) {
			hours = hours - 12;
			period = "pm";
		} else {
			period = "am";
		}
		if (hours === 0) {
			hours = 12
		}
		//date and time
		date = month + "/" + day + "/" + year;
		time = hours + ":" + minutes + period;
		//create the JSON object
		object = {
			"note": [{
				"data": {
					"note": note,
					"title": title,
					"id": id,
					"date": date,
					"time": time,
				  }
			}]
		};
		//add the object to local storage
		//stringify so I can store it as a key/value pair
		localStorage.setItem(id, JSON.stringify(object));
		//set the hash to home and reload the notes
		location.hash = page;
		this.show();
	},
	//remove all or one note(s)
	remove: function(id) {
		//make sure our thoughtful user actually wanted to delete something
		message.confirm("Are you sure?", function(result) {
			if (result === true) {
				//remove stuff
				if (id === "all") {
					localStorage.clear();
				} else {
					localStorage.removeItem(id);
				}
				//reload notes
				location.hash = "#home";
				notes.show();
			}
		});
	}
}
//simple animation system
var animate = {
	//helper function to check if object is visible
	offset: function(obj) {
		currtop = 0;
		if (obj.offsetParent) {
			do {
				currtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		return currtop;
	},
	//fade in an element. Doesn't matter if the element is already visible (which serves my purposes just fine)
	fade: function(elem, speed, callback) {
		if (elem.style) {
			elem.style.opacity = 0;
			elem.style.display = "block";
		}
		//set an interval and bump the opacity every time it runs
		var fadetimer = setInterval(function() {
			elem.style.opacity =+ (elem.style.opacity) + .02;
			if (elem.style.opacity >= 1) {
				clearInterval(fadetimer);
				//run a callback once I'm done fading
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	//this makes one element "push" all the other elements on the page down from the top of the page
	pushDown: function(elem, speed, callback) {
		window.scroll(0, 0);
		//somewhat hacky way to keep the speed even if the height is really tall or really short.
		numPerTime = elem.offsetHeight / 8;
		//get the children of the body
		nodes = document.getElementsByTagName("body")[0].children;
		//set the style for the pusher element
		elem.style.position = "absolute";
		elem.style.top = -elem.offsetHeight + "px";
		//loop through all the elements
		for (var i = 0; i < nodes.length; i++) {
			//make sure that I'm not looping on on the element that I'm "pushing" and that the element is a div and that it is visible.
			if (nodes[i] !== elem && nodes[i].tagName === "DIV" && this.offset(nodes[i]) >= 0) {
				nodes[i].style.position = "relative";
				nodes[i].style.top = 0;
			}
		}
		var pushTimer = setInterval(function() {
			runCallback = false;
			for (var i = 0; i < nodes.length; i++) {
				//make sure that the element is a div and that it is visible.
				if (nodes[i].tagName === "DIV" && (animate.offset(nodes[i]) >= 0 || nodes[i] === elem)) {
					//keep bumping the relative position from the top up
					nodes[i].style.top =+ parseInt(nodes[i].style.top) + numPerTime + "px";
					if (parseInt(nodes[i].style.top) >= elem.offsetHeight && nodes[i] !== elem) {
						//I've reached the end, run the callback when I'm done.
						runCallback = true;
					}
				}
			}
			//cool, run it.
			if (runCallback === true) {
				clearInterval(pushTimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	//same idea, in reverse. All the elements on the page push one element up out of sight
	pushUp: function(elem, speed, callback) {
		window.scroll(0, 0);
		numPerTime = elem.offsetHeight / 8;
		nodes = document.getElementsByTagName("body")[0].children;
		elem.style.position = "absolute";
		elem.style.top = 0;
		for (var i = 0; i < nodes.length; i++) {
			//make sure that I'm not looping on on the element that I'm "pushing" and that the element is a div and that it is visible.
			if (nodes[i] !== elem && nodes[i].tagName === "DIV" && this.offset(nodes[i]) >= 0) {
				nodes[i].style.position = "relative";
				nodes[i].style.top = elem.offsetHeight + "px";
			}
		}
		var pushTimer = setInterval(function() {
			runCallback = false;
			for (var i = 0; i < nodes.length; i++) {
				//make sure that the element is a div and that it is visible.
				if (nodes[i].tagName === "DIV" && (animate.offset(nodes[i]) >= 0 || nodes[i] === elem)) {
					nodes[i].style.top =+ (parseInt(nodes[i].style.top) - numPerTime) + "px";
					if (parseInt(nodes[i].style.top) <= 0 && nodes[i] !== elem) {
						runCallback = true;
					}
				}
			}
			//run me a callback
			if (runCallback === true) {
				clearInterval(pushTimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	}
}
//message system
var message = {
	speed: 10, //milliseconds
	hide: 4, //seconds
	ok: "Ok",
	cancel: "Cancel",
	classes: "message-box",
	//I'm lazy, I just remove all the old messages if a new one is made.
	clean: function() {
		window.clearTimeout(window.remove);
		nodes = document.querySelectorAll(".message-box");
		for (i = 0; i <= nodes.length; i++) {
			if (typeof(nodes[i]) !== "undefined") {
				nodes[i].parentNode.removeChild(nodes[i]);
			}
		}
	},
	//basic alert function.
	alert: function(msg) {
		this.clean();
		//make me a box!
		box = document.createElement("div");
		//set the classes
		box.setAttribute("class", this.classes + " alert");
		//put the msg in
		box.textContent = msg;
		//ok button can close the message early
		button = document.createElement("button");
		button.setAttribute("class", "success");
		button.textContent = this.ok;
		box.appendChild(button);
		//add the box to the body
		body = document.getElementsByTagName("body")[0];
		//animate it into position
		body.insertBefore(box, body.firstChild)
		animate.pushDown(box, this.speed);
		speedy = this.speed;
		//button click? Remove the message
		button.onclick = function() {
			window.clearTimeout(remove);
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
		}
		//timed out, remove the message
		window.remove = window.setTimeout(function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
		}, this.hide * 1000)
	},
	//confirmation
	confirm: function(msg, callback) {
		this.clean();
		//make me a box
		box = document.createElement("div");
		box.setAttribute("class", this.classes + " alert");
		box.textContent = msg;
		confirm = document.createElement("button");
		confirm.textContent = this.ok;
		confirm.setAttribute("class", "success");
		no = document.createElement("button");
		no.setAttribute("class", "danger");
		no.textContent = this.cancel;
		box.appendChild(confirm);
		box.appendChild(no);
		//add it to the body and animate it in
		body = document.getElementsByTagName("body")[0];
		body.insertBefore(box, body.firstChild)
		animate.pushDown(box, this.speed);
		speedy = this.speed;
		//if you click the confirm box call the callback with a true param
		confirm.onclick = function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
			callback(true);
		}
		//if you click cancel, then call the callback with false
		no.onclick = function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
			callback(false);
		}
	}
}

//BEGIN THE AWESOME!
marked.setOptions({ sanitize: true });
instance = notes.init(".notes-section ul");
instance.show();
window.onhashchange = instance.show;

//add notes
document.querySelector(".add-note").onclick = function() {
	animate.pushDown(document.querySelector(".new-note"), 4, function() {
		document.querySelector(".note-title").focus();
	});
	document.querySelector(".close").onclick = function() {
		animate.pushUp(document.querySelector(".new-note"), 4);
		document.querySelector(".note-title").value = "";
		document.querySelector(".note-text").value = "";
		return false;
	}
	//save new note
	document.querySelector(".save-note").onclick = function() {
		noteTitle = document.querySelector(".note-title").value;
		noteText = document.querySelector(".note-text").value;
		if (noteTitle !== "" && noteText !== "") {
			instance.create(noteTitle, noteText);
			document.querySelector(".note-title").value = "";
			document.querySelector(".note-text").value = "";
			animate.pushUp(document.querySelector(".new-note"), 4, function() {
				message.alert("Success! Note added.");
			});
		} else {
			message.alert("Error! You need to fill out all the fields.");
		}
		return false;
	}
	return false;
}
//delete all
document.querySelector(".delete-all").onclick = function() {
	instance.remove("all");
	return false;
}
//go home
document.querySelector("header h1").onclick = function() {
	location.hash = "#home";
}