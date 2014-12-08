
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
    if (data.me_msg) {
        addMeMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
    } else {
        addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
    }
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
    } else if (data.type == "wizz") {
        wizz(data.user, data.cid);
    } else if (data.type == "edit-msg") {
        newclear = Decrypt_Text(data.content, localStorage.getItem(key_id));
        replace_message(data.mid, data.content, newclear);
    }
}


/*
    This function sends edition relative data to the server and handle the response
*/
editMessage = function() {

}


sendMessage = function() {
    var msg = $("#new-msg").val();
    var me_msg = false
    /* Looking for '/me' substring */
    if (msg.substring(0, 4) == "/me ") {
        /* In this case, updating the boolean */
        me_msg = true;
        /* Removing the substring '/me ' */
        msg = msg.slice(4);
    }
    data = {
            cid: $("#cid").val(), 
            msg: Encrypt_Text(msg, localStorage.getItem(key_id)), 
            hash: $("#comptoir-key-hash").val(), 
            me_msg: me_msg,
        };
    switch (msg) {
    case "/wizz":
        jQuery.post(ws_wizz_url, data, acknowledged);
        break;
    default:
        jQuery.post(ws_msg_url, data, acknowledged);
    }
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

