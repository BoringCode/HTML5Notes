var animate = {
	fadeIn: function(elem, speed, callback = false) {
		if (elem.style) {
			elem.style.opacity = 0;
			elem.style.display = "block";
		}
		fadetimer = setInterval(function(){
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
	}
}

var notes = {
	title: null,
	section: null,
	hash: null,
	init : function(selector, title) {
		this.section = document.querySelector(selector)
		this.title = title
		return this
	},
	show : function() {
		console.log(this.title);
		section = this.section;
		newTitle = this.title;
		section.innerHTML = "";
		if (localStorage.length !== 0) {
			if (location.hash === "" || location.hash === "#home") {
				this.hash = null;
				for (key in localStorage) {
					//get the local storage key and value
					value = JSON.parse(localStorage.getItem(key));
					note = document.createElement("li")
					note.innerHTML = '<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '">View Note</a></li>';
				}
			} else {
				//check to make sure note exists
				if (location.hash.substring(1) in localStorage) {
					//check to make sure it hasn't been loaded already
					if (location.hash.substring(1) !== this.hash) {
						id = location.hash.substring(1);
						value = JSON.parse(localStorage.getItem(id));
						note = document.createElement("li");
						note.innerHTML = '<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' +value.note[0].data.time + '</time> <p>' + value.note[0].data.note + '</p>';
						newTitle = value.note[0].data.title + " | " + newTitle;
					}
				} else {
					note = document.createElement("li");
					note.innerHTML = "<h2>Looks like that note doesn't exist.</h2> <a href='#home'>Go back</a>";
					nTitle = "404 | " + newTitle;
				}
				this.hash = location.hash.substring(1);
			}
		} else {
			note = document.createElement("li");
			note.innerHTML = "<h1>Looks like there are no notes. Add some!</h1>";
		}
		section.appendChild(note);
		animate.fadeIn(note, 15);
		document.title = newTitle;
	},
	create: function(title, note) {
		note = note.replace(/(\r\n|\n|\r)/gm, "<br>");
		//come up with a random ID
		id = Math.floor(Math.random()*90000);
		//if the random ID has been used already, try again
		while (localStorage.getItem(id) !== null) {
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
		//add the object to local storage
		localStorage.setItem(id, JSON.stringify(object));	
		return true
	},
	remove: function(id) {
		if (id === "all") {
			localStorage.clear();
		} else {
			localStorage.removeItem(id);
		}
	}
}
instance = notes.init(".notes-section ul", "HTML5Notes")
instance.show()
window.onhashchange = instance.show;