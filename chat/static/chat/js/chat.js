/*
    This file manage the connection between the client and the server through web sockets.
*/

var msg_alert;
var sound_alert;

var sound_notification = function(type) {
    if (sound_alert.val() == 0) {
        return;
    }

    if (type == "msg" && !document.hasFocus()) {
        msg_alert.play();
        return;
    }

    if (type == "wizz") {
        wizz_alert.play();
    }
}


/* Creation of a socket instance */
var socket = new io.Socket();

var online = new Array();

/* Function to add a new message to the chat box.
 * Called at each reception of a message through the socket */
var addMessage = function(user, cipher, clear, msgdate, insert) {
    
    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    clear = linkify(clear);
    clear = smilify(clear);

    /* Tooltip for the date of the msg. For the client, 
       displayed in left ; for others in right */
    var tooltip_placement = function(user) {
        if (user != $("#user-name").html()) return "right";
        else return "left";
    }

    var new_message = ""

    /* Getting the last user to post a message */
    var last_date = $("#chatbox table tbody td.point:last a").attr("data-original-title");

    var last_user = $("#chatbox table tbody td span.user:last").text()

    /* Boolean to indicate if the last message was from a new user */
    var new_user = false;

    /* If the new message is NOT from the same user as the previous one, 
       we need to display the nickname of the new user */
    if (last_user != user) {
        new_user = true;
        new_message += '<tr class="author"><td>';
        if (user != $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</td><td class="nopoint"></td><td>';
        if (user === $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</td></tr>';
    }

    new_message += '<tr>';

    if (user != $("#user-name").html()) {
        new_message +=  '<td class="message"><span class="clear">' + clear + '</span><span class="ciphered hidden">"' + cipher + '</span></td>';
    } else {
        new_message +=  '<td></td>'; 
    }

    /* If the message is from the same user and the date is the same, we do not include a tooltip */
    if (!new_user && last_date === msgdate) {
        new_message += '<td class="nopoint"></td>';
    /* Otherwise, we need to add the date of the message */
    } else {
        new_message += '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="' + tooltip_placement(user) + '" rel="tooltip"> • </a></td>';
    }

    if (user != $("#user-name").html()) {
        new_message += '<td></td>';
    } else {
        new_message += '<td class="message"><span class="clear">' + clear + '</span><span class="ciphered hidden">' + cipher + '</span></td>';
    }

    new_message += '</tr>';
    
    if (insert) {
        /* Append the new message to the chatbox */
        $("#chatbox table tbody").append(new_message);

        $('.fsp-tooltip').tooltip('destroy').tooltip();

        /* Notification to the sound alert manager */
        if (user != $("#user-name").html()) {
            sound_notification("msg");
        }

    } else {
        return new_message;
    }


}

var join_comptoir = function() {
    console.log($("#cid").val());
    data = {action: "join", cid: $("#cid").val(), session_key: $('#session_key').val()};
    socket.send(data);
    $(".badge", "#my-" + $("#cid").val()).remove();
    return;
}


/* Connect the socket to the server with the comptoir id, 
   to be alerted on new messages posted on this comptoir */
var connected = function() {
    console.log($("#cid").val());
    // socket.subscribe($("#cid").val());
    data = {action: "identification", session_key: $('#session_key').val()};
    socket.send(data);
    join_comptoir();
    return;
}


/* Unrelevant for now */
var entityMap = {
    "À": "&Agrave;",
    "à": "&agrave;",
    "Â": "&Acirc;",
    "â": "&acirc;",
    "Ä": "&Auml;",
    "ä": "&auml;",
    "É": "&Éacute;",
    "é": "&eacute;",
    "È": "&Ègrave;",
    "è": "&egrave;",
    'Ù': "&Ugrave;",
    'ù': "&Ugrave;",
  };

var escapeHtml =  function (text) {
    return String(text).replace(/[ÀàÂâÄäÉéÈèÙù]/g, function (s) {
        return entityMap[s];
    });
}

/* Function to submit a new message through the socket */
var submit_msg = function() {
    /* The data contains:
            - the comptoir_id
            - the message encrypted with the secret key stored in the localStorage
            - a session key
            - the hash of the secret key, to allow the server to check that we indeed are allowed to 
            post on this comptoir
    */
    $("#new-msg").val().replace("\n", "<br />");
    data = {cid: $("#cid").val(), action: "post", content: Encrypt_Text($("#new-msg").val(), localStorage.getItem(key_id)), session_key: $('#session_key').val(), hash: $("#comptoir-key-hash").val()};

    socket.send(data);

    /* Cleaning the input field */
    $("#new-msg").val("");
}

/* Handler for the submission of the form */
$("#send-form").submit(function(event) {
    event.preventDefault();
    submit_msg();
});



/* Remember ctrl pressed to distinguish 
   Enter for submission and Enter for a line feed */
var ctrl_pressed = false;

var bind_keys = function() {

    /* Update on ctrl press */
    $('#new-msg').keyup(function(e){
        if(e.which == 17){
            ctrl_pressed = false;
        }
    });
    
    /* Submission with "Enter" key ; line feed if CTRL */
    $('#new-msg').keydown(function(e){
        if (e.which == 17) {
            ctrl_pressed = true;
        } else if (e.which == 13){
            if (!ctrl_pressed) {
                e.preventDefault();
                submit_msg();
            }
        }
    });
}


var update_badge = function(cid, user, date) {
    if ($(".badge", "#my-" + cid).length == 0) {
        $("td.td-name", "#my-" + cid).append("<span class=\"badge active\">1</span>");
    } else {
        var val = parseInt($(".badge", "#my-" + cid).text());
        $(".badge", "#my-" + cid).text(val + 1);
    }
    $(".fsp-tooltip", "#my-" + cid).attr("data-original-title", "Last message by " + user +"<br />(" + date +")").tooltip('fixTitle');
}


var online_to_string = function(online) {
    str = "";
    for (var i=0; i < online.length; i++) {
        str += online[i];
        if (i < online.length - 1) {
            str += ", ";
        }
    }
    return str;
}

online_div = $("#users-connected");

/* Handler for new data received through the socket */
var messaged = function(data) {

    if (data == null) return;

    /* If the data is a new message, we add it to the chatbox */
    if (data.type == "new-message") {
        /* Perform a verification on the cid: this avoids problems when the same user is connected simultaneously on
           several comptoirs, it may receive back its own message that targets another comptoir */
        if (data.cid != $("#cid").val()) {
            return;
        }
        addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, true);
        $("#chatbox").slimScroll({scrollTo: $("#chatbox")[0].scrollHeight + "px"});
    /* Elsif it is an error, we alert the user */
    } else if (data.type == "error") {
        pop_alert("danger", data.error_msg);

    } else if (data.type == "joined") {
        username = data.user;
        online = online_div.text().split(", ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        $("#users-connected").text(online_to_string(online));
        if (username != $("#user-name").text()) {
            pop_alert("info", "New connection: " + data.user);
        }

    } else if (data.type == "users") {
        online = "";
        for (var i = 0; i < data.users_list.length; i++) {
            username = data.users_list[i];
            online += data.users_list[i];
            if (i < data.users_list.length - 1) {
                online += ", ";
            }
        }
        $("#users-connected").text(online);

    } else if (data.type == "left") {
        username = data.user;
        console.log(username);
        online = online_div.text().split(", ");
        if (online.indexOf(username) != -1) {
            online.pop(username);
        }

        $("#users-connected").text(online_to_string(online));
        pop_alert("info", "Leaving: " + username);

    } else if (data.type == "wizz") {
        /* Notification to the sound alert manager */
        sound_notification("wizz");
        /* Shaking the chatbox */
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
        $("#content").effect("shake", {times: 6}, 500, function() {
            $("#chatbox").slimScroll({scrollTo: $("#chatbox")[0].scrollHeight + "px"});
        });
        $("#chatbox").slimScroll({scrollTo: $("#chatbox")[0].scrollHeight + "px"});
    } else if (data.type == "update-badge") {
        update_badge(data.cid, data.user, data.msgdate);
    }
}

var closed = function() {
    pop_alert("danger", "Connection closed !");
}

$("#wizz-btn").click( function() {

    data = {cid: $("#cid").val(), action: "wizz", hash: $("#comptoir-key-hash").val(), session_key: $('#session_key').val()};
    socket.send(data);

});


/* Mapping the two handlers */
socket.on('connect', connected);
socket.on('message', messaged);
socket.on('disconnect', closed);

var init_cmptr = function() {

        $('#chatbox').slimScroll({
            height: 'auto',
            position: 'right',
            size: '2px',
            railSize: '1px',
            distance: '20px',
            color: '#428bca',
            railColor: '#222',
            railOpacity: 0.1,
            wheelStep: 8,
            railVisible: true,
        });


        msg_alert = $("#msgAlert")[0];
        wizz_alert = $("#wizzAlert")[0];
        sound_alert = $("#sound-alert-btn");
        $("#chatbox").slimScroll({scrollTo: (parseInt($("#chatbox")[0].scrollHeight) - 150).toString() + "px"});
        bind_keys();

        /* Connect the socket to the server */
        socket.connect();

}

$("body").ready(function() {
        console.log($("#cid").val());
        init_cmptr();
});
