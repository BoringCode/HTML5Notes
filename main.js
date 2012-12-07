var animate = {
	fadeIn: function(elem, speed, callback = false) {
		if (elem.style) {
			elem.style.opacity = 0;
			elem.style.display = "block";
		}
		fadetimer = setInterval(function() {
			elem.style.opacity =+ (elem.style.opacity) + .02;
			if (elem.style.opacity >= 1) {
				clearInterval(fadetimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	fadeOut: function(elem, speed, callback = false) {
		if (elem.style) {
			elem.style.opacity = 1;
			elem.style.display = "block";
		}
		fadetimer = setInterval(function(){
			elem.style.opacity =+ (elem.style.opacity) - .02;
			if (elem.style.opacity <= 0) {
				clearInterval(fadetimer);
				elem.style.display = "none";
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	},
	pushDown: function(elem1, elem2, speed, callback = false) {
		if (elem1.style && elem2.style) {
			elem1.style.position = "relative";
			elem2.style.position = "absolute";
			elem1.style.top = 0;
			elem2.style.top = -elem2.offsetHeight + "px";
		}
		pushTimer = setInterval(function() {
			elem1.style.top =+ parseInt(elem1.style.top) + 25 + "px";
			elem2.style.top =+ parseInt(elem2.style.top) + 25 + "px";
			if (parseInt(elem1.style.top) >= elem2.offsetHeight) {
				clearInterval(pushTimer);
				if (typeof(callback) === "function") {
					callback();
				}
			}
		}, speed);
	}
}

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
					note.innerHTML = '<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '">View Note</a></li>';
					section.appendChild(note);
					animate.fadeIn(note, 20);
				}
			} else {
				note = document.createElement("li");
				//check to make sure note exists
				if (location.hash.substring(1) in localStorage) {
					//check to make sure it hasn't been loaded already
					if (location.hash.substring(1) !== this.hash) {
						id = location.hash.substring(1);
						value = JSON.parse(localStorage.getItem(id));
						note.innerHTML = '<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' +value.note[0].data.time + '</time> <p>' + value.note[0].data.note + '</p> <a href="#home">Go back</a>';
					}
				} else {
					note.innerHTML = "<h2>Looks like that note doesn't exist.</h2> <a href='#home'>Go back</a>";
				}
				note.setAttribute("class", "single-note");
				this.hash = location.hash.substring(1);
				section.appendChild(note);
				animate.fadeIn(note, 20);
			}
		} else {
			note = document.createElement("li");
			note.innerHTML = "<h1>Looks like there are no notes. Add some!</h1>";
			section.appendChild(note);
			animate.fadeIn(note, 20);
		}
	},
	create: function(title, note) {
		note = note.replace(/(\r\n|\n|\r)/gm, "<br>");
		//come up with a random ID
		id = Math.floor(Math.random()*90000);
		//if the random ID has been used already, try again
		while (id in localStorage) {
			id = Math.floor(Math.random()*90000);
		}
		//get the date and time
		currentTime = new Date()
		month = currentTime.getMonth() + 1;
		day = currentTime.getDate();
		year = currentTime.getFullYear();
		hours = currentTime.getHours();
		minutes = currentTime.getMinutes();
		if (minutes < 10){
			minutes = "0" + minutes
		}  
		date = month + "/" + day + "/" + year;
		time = hours + ":" + minutes;  
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
		console.log(object);
		//add the object to local storage
		localStorage.setItem(id, JSON.stringify(object));	
		location.hash = "#home";
	},
	remove: function(id) {
		if (id === "all") {
			localStorage.clear();
		} else {
			localStorage.removeItem(id);
		}
	}
}

instance = notes.init(".notes-section ul")
instance.show()
window.onhashchange = instance.show;

//add notes
document.querySelector(".add-note").onclick = function() {
	animate.pushDown(document.querySelector(".wrap"), document.querySelector(".new-note"), 10);
	//save new note
	document.querySelector(".save-note").onclick = function() {
		noteTitle = document.querySelector(".note-title").value;
		noteText = document.querySelector(".note-text").value;
		if (noteTitle !== "" && noteText !== "") {
			instance.create(noteTitle, noteText);
		}
		noteTitle = "";
		noteText = "";
	}
	return false;
}
//go home
document.querySelector("header h1").onclick = function() {
	location.hash = "#home";
}