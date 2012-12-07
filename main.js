var notes = {
	title: document.title,
	notesSection: document.querySelector(".notes-section"),
	fade: function(elem, speed) {
		if(elem.style) {
			elem.style.opacity = '0';
		}
		window.fadetimer = setInterval(function(){
			elem.style.opacity =+ (elem.style.opacity) + .02;
			if(elem.style.opacity > 1){
				clearInterval(fadetimer);
			}
		}, speed);
	},
	loadNotes : function() {
		console.log("GO GO")
		if (localStorage.length !== 0) {
			console.log("GO")
			notesSection.removeChild("li")
			for (var i = 0; i < localStorage.length; i++) {
				//get the local storage key and value
				key = localStorage.key(i);
				value = JSON.parse(localStorage.getItem(key));
				note = document.createElement("li")
				note.innerHTML('<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '">View Note</a></li>')
				note.style.opacity = 0;
				notesSection.appendChild(note)
				this.fade(note, 500)
			}
		}	
	}
}
notes.loadNotes()
window.onhashchange = notes.loadNote;