/*
    This file manage the connection between the client and the server through web sockets.
*/

/* Creation of a socket instance */
var socket = new io.Socket();

/* Function to add a new message to the chat box.
 * Called at each reception of a message through the socket */
var addMessage = function(user, cipher, clear, msgdate) {
    
    /* Tooltip for the date of the msg. For the client, 
       displayed in left ; for others in right */
    var tooltip_placement = function(user) {
        if (user != $("#user-name").html()) return "right";
        else return "left";
    }

    var new_message = ""

    /* Getting the last user to post a message */
    var len = $("#chatbox table tbody td.message").length;

    /* New message from another user */
    if (user != $("#user-name").html()) {
        new_message +=  '<tr><td class="message"><span class="clear">' + clear + '</span><span class="ciphered hidden">"' + cipher + '</span></td>' + 
                        '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="right" rel="tooltip"> • </a></td>' + 
                        '<td></td></tr>';
    /* New message from the client user */
    } else {
        new_message +=  '<tr><td></td>' + 
/*
<<<<<<<< HEAD
                        '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="left" rel="tooltip"> • </a></td>' + 
                        '<td>' + unescape(content) + '</td></tr>';
||||||| merged common ancestors
                        '<td><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="left" rel="tooltip"> • </a></td>' + 
                        '<td>' + unescape(content) + '</td></tr>';
=======
*/
                        '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="left" rel="tooltip"> • </a></td>' + 
                        '<td class="message"><span class="clear">' + clear + '</span><span class="ciphered hidden">' + cipher + '</span></td></tr>';
// >>>>>>> develop/security
    }

    /* Append the new message to the chatbox */
    $("#chatbox table tbody").append(new_message);

    $('.fsp-tooltip').tooltip('destroy').tooltip();
}

/* Connect the socket to the server with the comptoir id, 
   to be alerted on new messages posted on this comptoir */
var connected = function() {
    socket.subscribe($("#cid").val());
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
    data = {cid: $("#cid").val(), content: Encrypt_Text($("#new-msg").val(), localStorage.getItem(key_id)), session_key: $('#session_key').val(), hash: $("#comptoir-key-hash").val()};

    socket.send(data);

    /* Cleaning the input field */
    $("#new-msg").val("");
}

/* Handler for the submission of the form */
$("#send-form").submit(function(event) {
    event.preventDefault();
    submit_msg();
});

/* Submission with "Enter" key */
$('#new-msg').keypress(function(e){
    if(e.which == 13){
        event.preventDefault();
        submit_msg();
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
        alert(data.error_msg);
    }
}

/* Connect the socket to the server */
socket.connect();

/* Mapping the two handlers */
socket.on('connect', connected);
socket.on('message', messaged);

