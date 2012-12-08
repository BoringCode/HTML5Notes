var notes = {
	section: null,
	hash: null,
	init : function(selector) {
		this.section = document.querySelector(selector)
		return this
	},
	show : function() {
		section = this.section;
		section.innerHTML = "";
		if (localStorage.length !== 0) {
			if (location.hash === "" || location.hash === "#home") {
				this.hash = null;
				for (key in localStorage) {
					//get the local storage key and value
					value = JSON.parse(localStorage.getItem(key));
					note = document.createElement("li");
					title = document.createElement("h2");
					title.setAttribute("class", "note-title");
					title.textContent = value.note[0].data.title;
					note.appendChild(title);
					note.innerHTML += '<time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '" class="button success view">View</a></li>';
					section.appendChild(note);
					animate.fade(note, 20);
				}
			} else {
				note = document.createElement("li");
				//check to make sure note exists
				if (location.hash.substring(1) in localStorage) {
					//check to make sure it hasn't been loaded already
					if (location.hash.substring(1) !== this.hash) {
						id = location.hash.substring(1);
						value = JSON.parse(localStorage.getItem(id));
						title = document.createElement("h2");
						title.setAttribute("class", "note-title");
						title.textContent = value.note[0].data.title;
						note.appendChild(title);
						note.innerHTML += '<time>Created on ' + value.note[0].data.date + ' at ' +value.note[0].data.time + '</time>';
						noteContent = document.createElement("div");
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
					}
				} else {
					note.innerHTML = "<h2 class='no-notes'>Looks like that note doesn't exist.</h2> <a href='#home' class='button success'>Go back</a>";
				}
				note.setAttribute("class", "single-note");
				this.hash = location.hash.substring(1);
				section.appendChild(note);
				animate.fade(note, 20);
			}
		} else {
			note = document.createElement("li");
			note.innerHTML = "<h1 class='no-notes'>Looks like there are no notes. Add some!</h1>";
			section.appendChild(note);
			animate.fade(note, 20);
		}
	},
	edit: function(id) {
		value = JSON.parse(localStorage.getItem(id));
		document.querySelector(".note-title").value = value.note[0].data.title;
		document.querySelector(".note-text").value = value.note[0].data.note;
		animate.pushDown(document.querySelector(".new-note"), 10);
		document.querySelector(".close").onclick = function() {
			animate.pushUp(document.querySelector(".new-note"), 10);
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
				animate.pushUp(document.querySelector(".new-note"), 10, function() {
					message.alert("Success! Note added.");
				});
			} else {
				message.alert("Error! You need to fill out all the fields.");
			}
		}
	},
	create: function(title, note, id = false) {
		if (id === false) {
			//make me an id
			id = localStorage.length
			//the just in case thing
			while (id in localStorage) {
				id += 1;
			}
		}
		//get the date and time
		currentTime = new Date()
		month = currentTime.getMonth() + 1;
		day = currentTime.getDate();
		year = currentTime.getFullYear();
		hours = currentTime.getHours();
		minutes = currentTime.getMinutes();
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (hours > 12) {
			hours = hours - 12;
			period = "pm";
		} else {
			if (hours === 0) {
				hours = 12
			}
			period = "am";
		}
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
		localStorage.setItem(id, JSON.stringify(object));	
		location.hash = "#home";
		this.show();
	},
	remove: function(id) {
		//make sure our thoughtful user actually wanted to delete something
		message.confirm("Are you sure?", function(result) {
			if (result === true) {
				if (id === "all") {
					localStorage.clear();
				} else {
					localStorage.removeItem(id);
				}
				location.hash = "#home";
				notes.show();
			}
		});
	}
}
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
	fade: function(elem, speed, callback = false) {
		if (elem.style) {
			elem.style.opacity = 0;
			elem.style.display = "block";
		}
		var fadetimer = setInterval(function() {
			elem.style.opacity =+ (elem.style.opacity) + .02;
			if (elem.style.opacity >= 1) {
				clearInterval(fadetimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	pushDown: function(elem, speed, callback = false) {
		numPerTime = elem.offsetHeight / 8;
		nodes = document.getElementsByTagName("body")[0].children;
		elem.style.position = "absolute";
		elem.style.top = -elem.offsetHeight + "px";
		for (var i = 0; i < nodes.length; i++) {
			//make sure that I'm not looping on on the element that I'm "pushing" and that the element is a div and that it is visible.
			if (nodes[i] !== elem && nodes[i].tagName === "DIV" && this.offset(nodes[i]) >= 0) {
				nodes[i].style.position = "relative";
				nodes[i].style.top = 0;
			}
		}
		checkOffset = this.offset;
		var pushTimer = setInterval(function() {
			runCallback = false;
			for (var i = 0; i < nodes.length; i++) {
				//make sure that the element is a div and that it is visible.
				if (nodes[i].tagName === "DIV" && (checkOffset(nodes[i]) >= 0 || nodes[i] === elem)) {
					nodes[i].style.top =+ parseInt(nodes[i].style.top) + numPerTime + "px";
					if (parseInt(nodes[i].style.top) >= elem.offsetHeight && nodes[i] !== elem) {
						runCallback = true;
					}
				}
			}
			if (runCallback === true) {
				clearInterval(pushTimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	pushUp: function(elem, speed, callback = false) {
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
		checkOffset = this.offset;
		var pushTimer = setInterval(function() {
			runCallback = false;
			for (var i = 0; i < nodes.length; i++) {
				//make sure that the element is a div and that it is visible.
				if (nodes[i].tagName === "DIV" && (checkOffset(nodes[i]) >= 0 || nodes[i] === elem)) {
					nodes[i].style.top =+ (parseInt(nodes[i].style.top) - numPerTime) + "px";
					if (parseInt(nodes[i].style.top) <= 0 && nodes[i] !== elem) {
						runCallback = true;
					}
				}
			}
			if (runCallback === true) {
				clearInterval(pushTimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	}
}
var message = {
	speed: 10, //milliseconds
	hide: 4, //seconds
	ok: "Ok",
	cancel: "Cancel",
	classes: "message-box",
	clean: function() {
		window.clearTimeout(window.remove);
		nodes = document.querySelectorAll(".message-box");
		for (i = 0; i <= nodes.length; i++) {
			if (typeof(nodes[i]) !== "undefined") {
				nodes[i].parentNode.removeChild(nodes[i]);
			}
		}
	},
	alert: function(msg) {
		this.clean();
		box = document.createElement("div");
		box.setAttribute("class", this.classes + " alert");
		box.textContent = msg;
		button = document.createElement("button");
		button.setAttribute("class", "success");
		button.textContent = this.ok;
		box.appendChild(button);
		body = document.getElementsByTagName("body")[0];
		body.insertBefore(box, body.firstChild)
		animate.pushDown(box, this.speed);
		speedy = this.speed;
		button.onclick = function() {
			window.clearTimeout(remove);
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
		}
		window.remove = window.setTimeout(function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
		}, this.hide * 1000)
	},
	confirm: function(msg, callback) {
		this.clean();
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
		body = document.getElementsByTagName("body")[0];
		body.insertBefore(box, body.firstChild)
		animate.pushDown(box, this.speed);
		speedy = this.speed;
		confirm.onclick = function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
			callback(true);
		}
		no.onclick = function() {
			animate.pushUp(box, speedy, function() {
				body.removeChild(box);
			});
			callback(false);
		}
	}
}

//BEGIN THE AWESOME!
marked.setOptions({ sanitize: true })
instance = notes.init(".notes-section ul")
instance.show()
window.onhashchange = instance.show;

//add notes
document.querySelector(".add-note").onclick = function() {
	animate.pushDown(document.querySelector(".new-note"), 4);
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