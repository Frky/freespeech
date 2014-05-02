
var getPreviousMessages = function(callback, cid, senti) {

    var xhr = getXMLHttpRequest();
   
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText);
        }
    };

    xhr.open("GET", "previous_msg?cid=" + cid + "&senti=" + senti, true);
    xhr.send();

}

var loading = false;

var previousMsgCallback = function(data) {
    
        msgs = data["previous_msgs"];
        senti = data["senti"];
        var current_height = $("#chatbox").prop("scrollHeight");

        var key = $("#comptoir-key").val();

        messages_html = ""

        for (var i in msgs) {
            cipher = msgs[i].fields["content"];
            user = msgs[i].fields["owner"];
            date = msgs[i].fields["date"];
            clear = Decrypt_Text(cipher, key);
            messages_html += addMessage(user, cipher, clear, date, false);
        }

        $("#loader", "#chatbox").toggleClass("hidden");

        $("#chatbox table tbody").prepend(messages_html);
        $('.fsp-tooltip').tooltip('destroy').tooltip();
        var new_height = $("#chatbox").prop("scrollHeight");
        var real_height = $("#chatbox").height();
        var ink = String(new_height - current_height - real_height/2) + "px"

        $("#chatbox").slimScroll({scrollTo: String(new_height - current_height) + "px"});
        $("#chatbox").slimScroll({ scrollTo: ink, animate: true });

        $("#top_senti").val(senti);
        
        loading = false;

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



