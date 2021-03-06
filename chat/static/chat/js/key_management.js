/*
 * This file contains the JS code concerning the key gestion, 
 * ie the key hash verification in ajax, the generation of the key, the update of the hash automatically.
 */



/***
        Global variables
  ***/

/* Field of the key */
var key_field;
/* Field of the hash */
var hash_field;

var copy_key_btn;

var test_default_key = false;

/***
        Generation of a new key
***/ 

/**
 *  Update of the hash of the key if the key has been changed. Also update the 
 *  key value in localStorage.
 *
 *  @param  key_storage             index of the localStorage to store the key 
 *                                  (i.e. the key will be saved in localStorage[key_storage]
 *  @param  isInput                 Boolean to indicate if the key is in an input field (.val()) or in a
 *                                  div/span field (.text())
 *
 *  @return Nothing
 *
 **/
var update_key = function(cid, key) {
    if (key === "" || key == "undefined" || key == null) 
        return;

    var storage = "comptoir_key_" + cid;
    localStorage.removeItem(storage);
    localStorage.setItem(storage, key);
    
    var hash = CryptoJS.SHA3(key);
    hash_field.val(hash);
}

/* isTmp is a param that indicates if we have to save the key 
   from a tmp register to a permanent register */
var key_found = function(key) {
    key_field.val(key);
    update_key($("#cid").val(), key);
    if (key == "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        $("#cmptr-key-info").addClass("hidden");
    Decrypt_all();
}

var key_unknown = function() {
    if (test_default_key == true) {
        key_field.val("");
    }
    test_default_key = false;
    update_chatbox_msg("please provide a key for this comptoir:");
    enable_chatbox_msg_input();
}

/*
 *  Creation of a new AES random key
 *  This function is used at comptoir creation, 
 *  and updates key and hash field on creation field
 */
var create_key = function() {
    var new_key = Generate_key();
    key_field.val(new_key);
    var hash = CryptoJS.SHA3(new_key);
    hash_field.val(hash);
}   

var set_key = function(cid, key) {
    localStorage.setItem("comptoir_key_" + cid, key); 
}

/* CHECKING HASH IN AJAX */

var check_hash_callback = function(data, key) {
    if (data === "False") {
        key_unknown();
    } else {
        key_found(key);
    }
}

var check_hash = function(cid, key) {
    hash = CryptoJS.SHA3(key);
    var url = "check_hash?cid=" + cid + "&hash=" + hash;
    jQuery.get(url, function(data) {
        check_hash_callback(data, key);
    });
}

var checkHashUICallback = function(data) {
    // If the server returns False, it means that the username is already used
    if (data === "False") {
        return false;
        key_field.parent().parent().removeClass("hidden");
        key_field.parent().removeClass("has-success");
        key_field.parent().addClass("has-error");
        hash_field.parent().removeClass("has-success");
        hash_field.parent().addClass("has-error");
    } else {
        return true;
        key_field.parent().removeClass("has-error");
        key_field.parent().addClass("has-success");
        hash_field.parent().removeClass("has-error");
        hash_field.parent().addClass("has-success");
    }
}

var Decrypt_all = function() {

    var key = get_key($("#cid").val());

    if (!Test_Key(key)) return;
    
    /* First let's decrypt the cmptr description */
    decipher_cmptr_info(key);
    
    var del_author = null;

    /* Then let's decrypt all messages */
    $(".message").each(function() {
        var ciph = $( this ).find(".ciphered").text();
        var author = $( this ).parent().data("author");
        add_auth(author);
        if (ciph != "") {
            var clear = Decrypt_Text(ciph, key);
            if (clear == "/wizz") {
                incr_wizz();
                var prev = $(this).parent().prev();
                if (prev.hasClass("author")) {
                    del_author = prev.clone();
                    prev.remove();
                }
                $( this ).parent().html("<div class=\"central-msg wizz\"><span>" + author + " sent a wizz.</span></div>");

            } else if (clear.substring(0, 3) == "/me") {
                var prev = $(this).parent().prev();
                if (prev.hasClass("author")) {
                    del_author = prev.clone();
                    prev.remove();
                }
                $( this ).parent().html("<div class=\"central-msg me-msg\"><span>" + author + " " + clear.slice(4) + "</span></div>");
            } else {
                if (del_author != null && $(".user", del_author).text() == author) {
                    del_author.insertBefore($( this ).parent());
                }
                del_author = null;
                $( this ).find(".clear").text(clear);
                clear = msgify($(this).find(".clear").html());
                $( this ).find(".clear").html(clear);
                if (contains_link(clear)) {
                    add_link(clear, author == $("#user-name").text());
                }
                if (!$( this ).hasClass("central-msg")) {
                    $(this).append(glyphicon_options);
                }
            }
        } else if ( !$(this).parent().parent().hasClass("template") ) {
            $( this ).addClass("deleted");
            $( this ).find(".glyphicon-pencil").remove();
        }
    });
    $( this ).ready(function() {
        scroll_down(false);
        disable_chatbox_msg();
        msg_management_init_all();
    });
}

var get_key = function(cid) {
    var local_key_id = "comptoir_key_" + cid;
    return localStorage.getItem(local_key_id);
}

var get_hash = function(cid) {
    var local_key_id = "comptoir_key_" + cid;
    return CryptoJS.SHA3(localStorage.getItem(local_key_id));
}

var init_key_management_fields = function() {
    /* Key id to be use to index the localStorage */
    key_id = "comptoir_key_" + $("#cid").val();
    /* Key temporary register template */
    key_id_tmp = "comptoir_tmp_key_";
    /* Id for the temporary registers */
    tmp_id = -1;
    
    /* Field of the key */
    key_field = $("#comptoir-key");
    /* Field of the hash */
    hash_field = $("#comptoir-key-hash");
    copy_key_btn = $("#copy-key-button");
    
    $("#comptoir-key").change(function() {
        var key = key_field.val();
        var cid = $("#cid").val();
        update_key(cid, key);
        check_hash(cid, key);
    });

    $("#key-mirror").keyup(function() {
        if ($("#key-mirror").val().length == 64) {
            $("#comptoir-key").val($("#key-mirror").val());
            $("#comptoir-key").trigger("change");
        }
    });
}

var key_init = function() {
    
    /* This function checks if there is a key set up either on 
       the key register associated to this comptoir, or in some
       temporary register in case this is the first connection since the
       creation of the comptoir */

    // key_field.parent().parent().addClass("hidden");
    // copy_key_btn.addClass("hidden");
    // key_field.parent().removeClass("has-success");
    // key_field.parent().removeClass("has-error");

    var cid = $("#cid").val();
    var key = get_key(cid); 
    if (key === "" || key === null || key === "undefined") {
        test_default_key = true;
        key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    }
    key_field.val(key);
    check_hash(cid, key);
}


