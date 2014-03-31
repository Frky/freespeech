/*
    This file manage the connection between the client and the server through web sockets.
*/

var msg_alert;
var sound_alert;
var sound_notification = function(type) {
    if (sound_alert.val() == 0 || document.hasFocus()) {
        return;
    }

    if (type == "msg") {
        msg_alert.play();
    }
}

/* Creation of a socket instance */
var socket = new io.Socket();

/* Function to add a new message to the chat box.
 * Called at each reception of a message through the socket */
var addMessage = function(user, cipher, clear, msgdate) {
    
    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    clear = linkify(clear);

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

    /* Append the new message to the chatbox */
    $("#chatbox table tbody").append(new_message);

    $('.fsp-tooltip').tooltip('destroy').tooltip();

    /* Notification to the sound alert manager */
    if (user != $("#user-name").html()) {
        sound_notification("msg");
    }

}

/* Connect the socket to the server with the comptoir id, 
   to be alerted on new messages posted on this comptoir */
var connected = function() {
    socket.subscribe($("#cid").val());
    data = {action: "join", cid: $("#cid").val(), session_key: $('#session_key').val()};
    socket.send(data);
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

/* Handler for new data received through the socket */
var messaged = function(data) {
    /* If the data is a new message, we add it to the chatbox */
    if (data.type == "new-message") {
        addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate);
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
    /* Elsif it is an error, we alert the user */
    } else if (data.type == "error") {
        pop_alert("danger", data.error_msg);
    } else if (data.type == "users") {
        online = "";
        for (var i = 0; i < data.users_list.length; i++) {
            username = data.users_list[i];
            if (username == $("#user-name").html()) continue;
            if (i > 0) {
                online += " • ";
            }
            online += data.users_list[i];
        }
        $("#users-connected").text(online);
    }

}

/* Mapping the two handlers */
socket.on('connect', connected);
socket.on('message', messaged);

/* Connect the socket to the server */
socket.connect();

$("body").ready(function() {
        msg_alert = $("#msgAlert")[0];
        sound_alert = $("#sound-alert-btn");
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
});
