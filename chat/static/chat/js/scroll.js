
var getPreviousMessages = function(callback, cid, senti) {
  /* 
    $.ajax({
        type: "GET",
        dataType: "json",
        url:"previous_msg?cid=" + cid + "&senti=" + senti,
        success: previousMsgCallback(data)
    });

    return;
*/
    var xhr = getXMLHttpRequest();
   
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText);
        } else if (xhr.readyState < 4) {
            //document.getElementById("loader").style.display = "inline";
        }
    };

    xhr.open("GET", "previous_msg?cid=" + cid + "&senti=" + senti, true);
    // Sending request
    xhr.send();

}

var loading = false;

var previousMsgCallback = function(data) {
    
        msgs = data["previous_msgs"];
        senti = data["senti"];
        var current_height = $("#chatbox")[0].scrollHeight;
//        var offset = anchor.offset().top - $("#chatbox").scrollTop();

        var key = $("#comptoir-key").val();

        messages_html = ""

        for (var i in msgs) {
            cipher = msgs[i].fields["content"];
            user = msgs[i].fields["owner"];
            date = msgs[i].fields["date"];
            clear = Decrypt_Text(cipher, key);
            messages_html += addMessage(user, cipher, clear, date, false);
        }

        $("#chatbox table tbody").prepend(messages_html);
        $('.fsp-tooltip').tooltip('destroy').tooltip();
        var new_height = $("#chatbox")[0].scrollHeight;
        var real_height = $("#chatbox").height();
        $("#chatbox").scrollTop(new_height - current_height);
        $("#chatbox").animate({"scrollTop": new_height - current_height - real_height/2});

        $("#top_senti").val(senti);
        
        loading = false;
        $("#loader", "#chatbox").toggleClass("hidden");

}


/* Listener on the scroll top ; to load previous messages */
$("#chatbox").scroll(function () {
    if ($("#chatbox").scrollTop() == 0 && !loading) {
        loading = true;
        $("#loader", "#chatbox").toggleClass("hidden");
        senti = $("#top_senti").val();
        $.getJSON("previous_msg?cid=" + $("#cid").val() + "&senti=" + senti, previousMsgCallback);
    }
});



