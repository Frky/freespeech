
/* Ajax request for older messages */
var getPreviousMessages = function(callback, cid, senti) {

    var xhr = getXMLHttpRequest();
   
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            callback(xhr.responseText);
        }
    };

    xhr.open("GET", "previous_msg?cid=" + cid + "&senti=" + senti, true);
    xhr.send();

}

/* Global variable used to know if a request is already pending */
var loading = false;

/* Callback for older messages request.
 Prepend older messages to chatbox */
var previousMsgCallback = function(data) {
    
        /* Getting previous messages from the response */
        msgs = data["previous_msgs"];
        /* Oldest message we have now */
        senti = data["senti"];

        /* Chatbox height before the prepend action. Used to keep the chatbox scroll
            on the senti after the prepend */
        var current_height = $("#chatbox").prop("scrollHeight");

        /* Get the key to decipher older messages */
        var key = $("#comptoir-key").val();

        /* We now treat each older message we received */
        messages_html = ""
        for (var i in msgs) {
            cipher = msgs[i].fields["content"];
            user = msgs[i].fields["owner"];
            date = msgs[i].fields["date"];
            /* Deciphering the message */
            clear = Decrypt_Text(cipher, key);
            /* Add it to the html container */
            messages_html += addMessage(user, cipher, clear, date, false);
        }

        $("#loader", "#chatbox").toggleClass("hidden");

        /* Prepend the older messages to the chatbox */
        $("#chatbox table tbody").prepend(messages_html);

        /* Scrolling back to where we were before the load */
        var new_height = $("#chatbox").prop("scrollHeight");
        var real_height = $("#chatbox").height();
        var ink = String(new_height - current_height - real_height/2) + "px"
        $("#chatbox").slimScroll({scrollTo: String(new_height - current_height) + "px"});
        $("#chatbox").slimScroll({ scrollTo: ink, animate: true });

        /* Setting all the tooltips for dates */
        $('.fsp-tooltip').tooltip('destroy').tooltip();

        /* Setting the senti to the new value */
        $("#top_senti").val(senti);
        
        loading = false;

}


/* Listener on the scroll top ; to load previous messages */
$("#chatbox").scroll(function () {

    /* If we have reached the top of the scroll bar and if we are not already loading some messages */
    if ($("#chatbox").scrollTop() == 0 && !loading) {
        /* Setting global variable to avoid multiple simultaneous queries */
        loading = true;
        /* Display the loader */
        $("#loader", "#chatbox").toggleClass("hidden");
        /* Getting the id of the oldest message we have */
        senti = $("#top_senti").val();
        /* Request for older posts starting from senti */
        $.getJSON("previous_msg?cid=" + $("#cid").val() + "&senti=" + senti, previousMsgCallback);
    }
});



