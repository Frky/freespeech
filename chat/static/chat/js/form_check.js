/***
        This module handles all form submissions and check a first time 
        the validity of the form. Of course, the form is checked once again 
        on the server side.
  ***/

var checkComptoirForm = function(form) {

    var valid = true;

    /* Checking Comptoir title */
    if ($("#id_title", form).val() === "") {
        $("#id_title").parent().addClass("has-error");
        pop_alert("danger", "A comptoir name is required.");
        valid = false;
    } else {
        $("#id_title").parent().removeClass("has-error");
    }

    if ($("#public input[type=radio][name=public]:checked").val() == 'public') {
        $("#comptoir-key-hash").val(CryptoJS.SHA3("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
    } else if ($("#comptoir-key-hash", form).val() === "") {
        $("#comptoir-key-hash").parent().addClass("has-error");
        pop_alert("danger", "To create a private comptoir, the hash of a key is required.");
        valid = false;
    } else {
        $("#comptoir-key-hash").parent().removeClass("has-error");
    }

    return valid;
}


var created = function(cid, key) {
    console.log("Setting key for " + cid + ": " + key);
    set_key(cid,  key); 
    window.location.href = cid;

}

var submit_cform = function (form) {
    var key;
    if (!checkComptoirForm($( this ))) {
        return;
    }
    var clear_title = $("#id_title", form).val();
    var clear_desc = $("#id_description", form).val();
    if ($("#public input[type=radio][name=public]:checked").val() == 'public') {
        console.log("Public cmptr");
        key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    } else {
        console.log("Private cmptr");
        key = $("#comptoir-key").val();
    }
    console.log("Clear: " + clear_title + " | key: " + key);
    var ciphered_title = Encrypt_Text(clear_title, key);
    console.log("Clear: " + clear_desc + " | key: " + key);
    var ciphered_desc = Encrypt_Text(clear_desc, key);
    $("#id_title", form).val(ciphered_title);
    $("#id_description", form).val(ciphered_desc);
    // To change
//    form.submit();
    $.post("create_comptoir", $("#comptoir-form").serialize(), function(data) {
        /* TODO change case of error */
        if (data.substring(0, 4) == "cid_")
            created(data.substring(4), key);
        else
            console.log("Error creating form");
    });
}

