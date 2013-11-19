// !function($) {
/*
    // Constructor of an XMLHttpRequest object
    var getXMLHttpRequest = function() {
        var xhr = null;
         
        if (window.XMLHttpRequest || window.ActiveXObject) {
            if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch(e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
            } else {
                xhr = new XMLHttpRequest();
            }
        } else {
            // XMLHttpRequest not supported by the browser
            return null;
        }
         
        return xhr;
    }

    // AJAX method to check is username is available for registration
    var update = function(callback) {

        // Creation of an object
        var xhr = getXMLHttpRequest();

        // AJAX function on change
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
                // Callback for results
                callback(xhr.responseText);
            } 
        };
    
        // Initialisation
        xhr.open("POST", "update", senti, true);
        // Sending request
        xhr.send(null);
    }

    var updateCallback = function(data) {	
		$("#chatbox").append("Parapluie");
    }


    $('#click').click(function () {
	var senti = $("#last-msg").val();
	alert(senti);
        update(updateCallback);
    });
	

*/	

setInterval(function() {
  var senti = $("#last-msg").val();
  var cid = $("#cid").val()
  $.ajax({url:"update", type:"POST", data: {cid: cid, index: senti}, success: function(result){
	var msgs = jQuery.parseJSON(result);
	var idx = 0;
	$.each( msgs, function( key, value ) {
		$.each( value, function( k, v ) {
			if (k === "fields") {
				$.each( v, function( x, m) {
					if (x === "content" && m != "") {
						idx++;
    						$("#chatbox").append("<p>" + m + "</p>"); //['1'].content);
					}
			});
			}
		});
	});
	$("#last-msg").val(idx + parseInt(senti));
  }});
}, 2000); 
