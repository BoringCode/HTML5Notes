//start happy time after the document has loaded
$(document).ready(function() {

//this function handles going back to the homescreen where all the notes are listed*/
  function goHome() {
    //change title to HTML5Notes
    document.title = 'HTML5Notes';

    //run the loadNotes() function. Just in case there are new notes to display
    loadNotes();

    //hide the note viewer and slidedown the note list
    $(".noteviewer").fadeOut("slow");
    $("section ul").slideDown("slow");

    //change the hash to home to prevent issues where you can not click the same note you were just viewing
    window.location.hash = "home";
  }
  
  $(window).hashchange( function(){
	//remove the # sign from the beginning of the hash
	newHash = window.location.hash.substring(1);
	//make sure the hash isn't empty or the home hash, if it is return false and exit the function
	if (newHash === "" || newHash === "home") {
	return false;
	}
	//get the value of the note that was specified by the hash
	value = JSON.parse(localStorage.getItem(newHash));
	//if it actually exists, do something
	if (value !== null) {
	//change the title to display the title of the note
	document.title = 'HTML5Notes - ' + value.note[0].data.title;  
	//slide the note list up
	$("section ul").slideUp("slow");	
	//set the value of the #notesection to what is included in the JSON value
	$("#notesection").html('<h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' +value.note[0].data.time + '</time> <p>' + value.note[0].data.note + '</p>');
	//add a delete button. I have to do it this way in order to add a click function to the dynamically added delete button
	$('#notesection').append(function() {
	return $('<a href="#" >Delete</a>').click(function () {
	//remove the item with the id that matches the value
    localStorage.removeItem(value.note[0].data.id);
	//run the go back to home sweet home function
	goHome();
	return false;
	})
	})
	$(".noteviewer").fadeIn("slow");
	}
 }) 

  //display the #newnote div when clicking on the add note button
  $('#addnote').click(function () {
    $("#newnote").fadeIn("slow");  
    return false;
  });

  //get all the notes and add them as a list item to section ul
  function loadNotes() {
  //check to see if there is actually something to load
  if (localStorage.length === 0) {
  //add the error message if there isn't anything
   $("section ul").html('<h1>Looks like there are no notes. Add some!</h1>');
   return false;
   }
   //clear the list
   $("section ul").empty();   
   var key, value;
   for (var i = 0; i < localStorage.length; i++) {
	 //get the key of the current item
     key = localStorage.key(i);
	 //get the value and parse it as JSON
     value = JSON.parse(localStorage.getItem(key));
	 //append the list item with the data inside
     $('section ul').append('<li><h2>' + value.note[0].data.title + '</h2> <time>Created on ' + value.note[0].data.date + ' at ' + value.note[0].data.time + '</time> <a href="#' + value.note[0].data.id + '">View Note</a></li>');
   }
  }
  
  //handle adding a new note
  $("#submitnote").click(function () {
  //get the value of the two inputs
  var title = $("#notetitle").val();
  var note = $("#notetext").val();
  //check to make sure they aren't empty
  if (title !== "" && note !== "") {
  //replace line breaks with break tags
  var note = note.replace(/(\r\n|\n|\r)/gm,"<br>");
  //come up with a random ID
  var id = Math.floor(Math.random()*90000);
  //if the random ID has been used already, try again
  if (localStorage.getItem(id) !== null) {
  var id = Math.floor(Math.random()*90000);
  }
  //get the date and time
  var currentTime = new Date()
  var month = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var year = currentTime.getFullYear();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  if (minutes < 10){
  minutes = "0" + minutes
  }  
  var date = month + "/" + day + "/" + year;
  var time = hours + ":" + minutes;
  
  //create the JSON object
  var object = {
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
  //reload the notes
  loadNotes();
  //hide the newnote div and set the values of the inputs to nothing
  $("#newnote").fadeOut("slow");  
  $("#notetext").val("");
  $("#notetitle").val("");
  }
  });
  
  //add a click function to the close button for the #newnote div
  $("#closenewnote").click(function() {
   $("#newnote").fadeOut("slow");
   return false;
  }) 

  //check the "View All" button for a click, if there is one run the go back to sweet home Alabama function
  $(".back").click(function() {
  goHome();
  return false;
  });

  //check the header for a click, if there is one run the go back to Russia function
  $("header h1").click(function() {
  goHome();
  });
  
  //add a click function to the delete all button
  $('#deleteall').click(function () {
  //remove all those notes, who needs them anyway?!?
  localStorage.clear();
  //go home baby!
  goHome();
  return false;
  });
  
  //check for a click on the body that isn't on the #newnote div. Hide the #newnote div if there is one
  $('body').click(function(event) {
    if (!$(event.target).closest('#newnote').length) {
        $('#newnote').fadeOut("slow");
    };
	});
  
  //run the loadNotes() function
  loadNotes();
  
  //run the hashchange function
  $(window).hashchange();
});