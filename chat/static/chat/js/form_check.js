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
        valid = false;
    } else {
        $("#id_title").parent().removeClass("has-error");
    }


    if ($("#id_public").is(":checked")) {
        $("#comptoir-key-hash").val(CryptoJS.SHA3("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
    } else if ($("#comptoir-key-hash", form).val() === "") {
        $("#comptoir-key-hash").parent().addClass("has-error");
        valid = false;
    } else {
        $("#comptoir-key-hash").parent().removeClass("has-error");
    }

    return valid;
}

$("#id_public").change(function() {
    $("#id_key_hash-container").toggle("hidden");
});

$("#comptoir-form").submit(function() {
    if (!checkComptoirForm($( this ))) {
        event.preventDefault();
    }
});

