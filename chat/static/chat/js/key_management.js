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
    Decrypt_all();
}

var key_unknown = function() {
    console.log("Key is unknown for this comptoir");
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
    console.log(cid, key);
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

    if (!Test_Key(localStorage.getItem(key_id))) return;
    
    /* First let's decrypt the cmptr description */
    decipher_cmptr_info(localStorage.getItem(key_id));
    
    /* Then let's decrypt all messages */
    $(".message").each(function() {
        var ciph = $( this ).find(".ciphered").text();
        if (ciph != "") {
            var clear = Decrypt_Text(ciph, localStorage.getItem(key_id));
            if (clear == "/wizz") {
                var author = $( this ).parent().data("author");
                $( this ).parent().html("<td colspan=\"3\" class=\"central-msg wizz\">" + author + " sent a wizz.</td>");

            } else {
                $( this ).find(".clear").text(clear);
                $( this ).find(".clear").html(msgify($( this ).find(".clear").html()));
                if ($( this ).is(":last-child", "tr") && !$( this ).hasClass("central-msg")) {
                    $(this).append(glyphicon_options);
                }
            }
            /*
            if (clear.substring(0, 3) == "/me") {
                meify($( this ).parent());
            }
            */
            /*
            else {
                var author = $( this ).parent().data("author");
                var el = $( this ).parent();
                el.html("<td colspan=\"3\" class=\"central-msg me\"></td");
                $("td", el).text(author + clear);
                $("td", el).find("").html(smilify(linkify(crlfy($( this ).find(".clear").html()))));
            }
            */
        } else {
            $( this ).find(".clear").html("<i class=\"msg-deleted\">Message deleted.</i>");
            $( this ).find(".glyphicon-pencil").remove();

        }
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
        Decrypt_all();
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
        key_unknown();
    } else {
        key_field.val(key);
        check_hash(cid, key);
    }
}


