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

    if ($("#public-btn").val() == 1) {
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

$("#comptoir-form").submit(function() {
    console.log($("#public-btn").val());
    if (!checkComptoirForm($( this ))) {
        event.preventDefault();
    }
});

