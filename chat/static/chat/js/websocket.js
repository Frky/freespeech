
var ws4redis;
var sendMessage;

var new_msg = function(data) {
    /* Perform a verification on the cid: this avoids problems when the same user is connected simultaneously on
    several comptoirs, it may receive back its own message that targets another comptoir */
    if (data.cid != $("#cid").val()) {
        update_badge(data.cid, data.user, data.msgdate);
        sound_notification("msg", data.cid);
        return;
    }
    /* Testing if this is a '/me' message */
//    if (data.me_msg) {
//        addMeMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
//    } else {
        addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
//    }
    $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
} 

var acknowledged = function() {
    $("#new-msg").val("");
    $("#new-msg").focus();
}


/* 
   This function handles a message from the server.
   It dispatches the action depending on the type 
   of the data received. 
*/
var receiveData = function(data) {
    data = JSON.parse(data)
    if (data.type == "new-msg") {
        new_msg(data);
    } else if (data.type == "error") {
         pop_alert("danger", data.error_msg);
    } else if (data.type == "joined") {
        add_user_online(data.user, data.cid);
    }
}

// attach this function to an event handler on your site
sendData = function() {
    var msg = $("#new-msg").val();
    data = {
                cid: $("#cid").val(), 
                msg: Encrypt_Text(msg, localStorage.getItem(key_id)), 
                hash: $("#comptoir-key-hash").val(), 
            };
    jQuery.post(ws_msg_url, data, acknowledged);
}


$(document).ready(function() {
    ws4redis = WS4Redis({
        uri: ws_uri + 'fsp?subscribe-user',
        receive_message: receiveData,
        heartbeat_msg: ws_heartbeat,
    });
    data = {
                session_key: $('#session_key').val(), 
            };
    jQuery.post(ws_identicate_url);
});
