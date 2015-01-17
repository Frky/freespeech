
var glyph_edited = "<span class=\"glyphicon glyphicon-pencil\"></span>"
var delete_message_on_server = function(cid, mid, chash, callback) {

    // Creation of an object
    var xhr = getXMLHttpRequest(); 

    // AJAX function on change    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText, mid);
        }
    };

    // Initialisation
    xhr.open("GET", "remove-msg?cid=" + cid + "&mid=" + mid + "&chash=" + chash, true);
    // Sending request
    xhr.send();
}


var delete_msg_on_server_callback = function(data, mid) {
    if (data != "OK") {
        pop_alert("danger", "An error occurred, your message has not been deleted.");
    } else {
        $(".message#" + mid).html("<i class=\"msg-deleted\">Message deleted.</i>");
    }
}

var del_msg_client = function(element) {
        msg_id = element.parents(".message")[0].id;
        $("#msg-to-delete").val(msg_id);
        $("#msg-to-delete-content").text($(".clear", element.parents(".message")[0]).text());
        $('#confirm-del-msg').modal();
}

/*
var edit_msg_server = function(msgid, oldcipher, newcipher) {
//    data = {action: "edit", hash: $("#comptoir-key-hash").val(), mid: msgid, oldmsg: oldcipher, newmsg: newcipher, session_key: $(".cipher", ".message#" + msgid)};
    data = {action: "edit-msg", cid: $("#cid").val(), hash: $("#comptoir-key-hash").val(), mid: msgid, oldmsg: oldcipher, newmsg: newcipher, session_key: $('#session_key').val()};
    socket.send(data);
}
*/


var edit_msg_client = function(element) {
        msg_id = element.parents(".message")[0].id;
        $("#msg-to-edit").val(msg_id);
        $('#edit-msg').modal();
        setTimeout(function () { 
            $("#edit-msg-box").focus(); 
            $("#edit-msg-box").val($(".clear", element.parents(".message")[0]).text());
        }, 500);
}


var msg_management_init_all = function() {
    $(".message:last-child", "tr").hover(function() {
        $("span.glyphicon-options", this).removeClass("invisible");
    }, function() {
        $("span.glyphicon-options", this).addClass("invisible");
    });
    $(".glyphicon-edit", ".message").click(function() {
        edit_msg_client($( this ));
    });
    $(".glyphicon-remove", ".message").click(function() {
        del_msg_client($( this ));
    });
}


var add_glyphicons = function(text) {
    return text + glyphicon_options;
}

var msg_management_init = function(msg_el) {
    msg_el.hover(function() {
        $("span.glyphicon-options", this).removeClass("invisible");
    }, function() {
        $("span.glyphicon-options", this).addClass("invisible");
    });
    $(".glyphicon-edit", msg_el).click(function() {
        edit_msg_client($( this ));
    });
    $(".glyphicon-remove", msg_el).click(function() {
        del_msg_client($( this ));
    });
}


var remove_message = function(mid) {
    cid = $("#cid").val();
    chash = hash_field.val();
    delete_message_on_server(cid, mid, chash, delete_msg_on_server_callback);
}


var pre_edition = function() {
    $("#edit-msg").modal('hide');
    mid = $("#msg-to-edit").val();
    oldcipher = $(".ciphered", ".message#" + mid).text();
    newclear = $("#edit-msg-box").val();
    newcipher = Encrypt_Text(newclear, localStorage.getItem(key_id));
    editMessage(mid, oldcipher, newcipher);
}


$("#confirm-edit-msg-btn").click(pre_edition);


$("#confirm-del-msg-btn").click(function() {
    $("#confirm-del-msg").modal('hide');
    mid = $("#msg-to-delete").val();
    remove_message(mid);
});
