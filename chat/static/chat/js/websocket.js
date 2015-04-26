
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
    /* Decrypt message */
    var msg = Decrypt_Text(data.content, get_key($("#cid").val()));
    /* Testing if this is a '/me' message */
    // todo: factoriser
    if (msg.substring(0, 4) == "/me ") {
        msg = msg.slice(3);
        msg = data.user + msg;
        addMessage(data.user, data.content, msg, data.msgdate, data.mid, true, true);
    } else {
        addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true, false);
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
    /* Perform a verification on mid: avoid multiple reception of same message */
    var last_mid = $(".message:last", "#chatbox").attr("id");
    if (last_mid >= data.mid)
        return;
    if (data.type == "new-msg") {
        new_msg(data);
    } else if (data.type == "error") {
         pop_alert("danger", data.error_msg);
    } else if (data.type == "joined" || data.type == "connected") {
        add_user_online(data.user, data.cid, data.type == "joined");
    } else if (data.type == "left") {
        remove_user_online(data.user, data.cid);
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
editMessage = function(mid, oldcipher, newcipher) {
    var data = {
                cid: $("#cid").val(), 
                hash: $("#comptoir-key-hash").val(), 
                mid: mid, 
                oldmsg: oldcipher, 
                newmsg: newcipher, 
            };
    jQuery.post(ws_edit_url, data, acknowledged);
}


sendMessage = function() {
    var msg = $("#new-msg").val();
    var cid = $("#cid").val();
    var me_msg = false

    console.log(msg, cid);
    /* Does this message contain a link ? */
    /* to be used in the future to keep trace of links */
    if (contains_link(msg))
        console.log("LINK DETECTED");
    else
        console.log("No link.");

    /* Do we keep history for this comptoir ? */
    var keep = keep_history(cid);

    /* Looking for '/me' substring */
//    if (msg.substring(0, 4) == "/me ") {
//        /* In this case, updating the boolean */
//        me_msg = true;
//        /* Removing the substring '/me ' */
//        msg = msg.slice(4);
//    }
    var local_key = get_key(cid); //localStorage.getItem(key_id);
    console.log("Key: " + local_key);
    var local_hash = get_hash(cid); //localStorage.getItem(key_id);
    data = {
            cid: cid, 
            msg: Encrypt_Text(msg, local_key), 
            hash: local_hash.toString(),
            me_msg: me_msg,
            keep: keep,
        };
    switch (msg) {
    case "/wizz":
        jQuery.post(ws_wizz_url, data, acknowledged);
        break;
    default:
        console.log(data);
        jQuery.post(ws_msg_url, data, acknowledged);
    }
}


var init_socket = function() {
    ws4redis = WS4Redis({
        uri: ws_uri + 'fsp?subscribe-user',
        receive_message: receiveData,
        // heartbeat_msg: "--heartbeat--", //ws_heartbeat,
    });
    data = {
                session_key: $('#session_key').val(), 
            };
    jQuery.post(ws_identicate_url);
}

