
var glyph_edited = "<span class=\"glyphicon glyphicon-pencil\"></span>"

var modal_options; // = {fadeDuration: 250};

var delete_msg_on_server_callback = function(data, mid) {
    if (data != "OK") {
        pop_alert("danger", "An error occurred, your message has not been deleted.");
    } else {
        $(".message#" + mid).html("<i class=\"msg-deleted\">Message deleted.</i>");
    }
}


var del_msg_client = function(msg_div) {
    var mid = $(".message", msg_div).attr("id");
    $("#msg-to-delete").val(mid);
    $("#msg-to-delete-content").text($(".clear", msg_div).text());
    $('#confirm-del-msg').modal(modal_options);
    $("#delete-btn").click(function() {
        $.modal.close();
        deleteMessage(mid, $(".ciphered", msg_div).text());
    });
    $("#cancel-btn").click(function() {
        $.modal.close();
    });
}

/*
var edit_msg_server = function(msgid, oldcipher, newcipher) {
//    data = {action: "edit", hash: $("#comptoir-key-hash").val(), mid: msgid, oldmsg: oldcipher, newmsg: newcipher, session_key: $(".cipher", ".message#" + msgid)};
    data = {action: "edit-msg", cid: $("#cid").val(), hash: $("#comptoir-key-hash").val(), mid: msgid, oldmsg: oldcipher, newmsg: newcipher, session_key: $('#session_key').val()};
    socket.send(data);
}
*/


var edit_msg_client = function(msg_div) {
    var mid = $(msg_div).attr("id");
    $(msg_div).addClass("editing");
    $("#msg-to-edit").val(mid);
    $('#edit-msg').modal(modal_options);
    setTimeout(function () { 
       $("#edit-msg-box").focus(); 
       $("#edit-msg-box").val($(".clear", msg_div).text());
    }, 500);
}


var msg_management_init_all = function() {
    $("#valid-edit-btn").click(pre_edition);
    $(".message", "#chatbox .myself").each(function() {
        msg_management_init(this);
    });
    return;
}


var add_glyphicons = function(div) {
    $(".message", div).append(glyphicon_options);
}

var msg_management_init = function(msg_el) {
    $(msg_el).hover(function() {
        $("span.glyphicon-options", msg_el).removeClass("invisible");
    }, function() {
        $("span.glyphicon-options", msg_el).addClass("invisible");
    });
    $(".glyphicon-edit", msg_el).click(function() {
        edit_msg_client(msg_el);
    });
    $(".glyphicon-remove", msg_el).click(function() {
        del_msg_client(msg_el);
    });
}


var pre_edition = function() {
    $.modal.close();
    mid = $("#msg-to-edit").val();
    oldcipher = $(".ciphered", ".message#" + mid).text();
    newclear = $("#edit-msg-box").val();
    newcipher = Encrypt_Text(newclear, get_key($("#cid").val()));
    editMessage(mid, oldcipher, newcipher);
}


var init_edit = function() {
    $("#edit-msg-box").keydown(function(e){
        if (e.which == 13 && !e.ctrlKey){
            if (!e.crtlKey) {
                e.preventDefault();
                pre_edition();
            }
        }
    });
}
