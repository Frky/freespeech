/* This function asks for an update of new messages every 2 seconds */
setInterval(function() {
  var senti = $("#last-msg").val();
  var cid = $("#cid").val()
  $.ajax({url:"update", type:"POST", data: {cid: cid, index: senti}, success: function(result){
	var msgs = jQuery.parseJSON(result);
	var idx = 0;
	$.each( msgs, function(key, value ) {
        $.each(value, function(v, x) {
            if (v === "fields") {
                var user_name = "";
                var msg_content = "";
                $.each(x, function(k, c) {
                    if (k === "content") {
                        msg_content = c;
                    } else if (k === "owner") {
                        user_name = c;
                    }
                });

                var new_message = ""

                if (user_name != $("#user-name").val()) {
                    new_message += "<div class=\"message others\">";
                } else {
                    new_message += "<div class=\"message me\">";
                }
                
                new_message += "<p class=\"msg-info\"><span class=\"user\">" + user_name + "</span></p>";
                new_message += "<p class=\"msg-content\">" + msg_content + "</p>";
                new_message += "</div>";
            
                $("#chatbox").append(new_message);
                idx += 1;
            }
	});
	});
	$("#last-msg").val(idx + parseInt(senti));

    if (idx != 0) {
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
    }
  }});

}, 2000); 

var submit_msg = function() {
    
    if (event != null) {
        event.preventDefault();
    }

    var cid = $("#cid").val();    
    var msg = $("#new-msg").val();

    $.ajax({url:"send", type:"POST", data: {cid: cid, msg: msg}, success: function () {
        $("#new-msg").val("");
    }});

};

$("#send-form").submit(function (event) {
    event.preventDefault();
    submit_msg();
});

$('#new-msg').keypress(function(e){
    if(e.which == 13){
        submit_msg();
    }
});
  
$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);

