/*
 * This file contains the JS code concerning the key gestion, 
 * ie the key hash verification in ajax, the generation of the key, the update of the hash automatically.
 */



/***
        Global variables
  ***/

/* Key id to be use to index the localStorage */
var key_id = "comptoir_key_" + $("#cid").val();
/* Key temporary register template */
var key_id_tmp = "comptoir_tmp_key_";
/* Id for the temporary registers */
var tmp_id = 0;

/* Field of the key */
var key_field = $("#comptoir-key");
/* Field of the hash */
var hash_field = $("#comptoir-key-hash");


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
var updateKey = function(key_storage, isInput) {
    var local_key;
    if (isInput) {
        local_key = key_field.val();
    } else {
        local_key = key_field.text();
    }
        
    localStorage.setItem(key_storage, local_key);
    
    if (local_key != "" && local_key != " ") {
        console.log(local_key);
        var comptoir_key_hash = CryptoJS.SHA3(local_key);
        hash_field.val(comptoir_key_hash);
    }
}

/**
 *  Generation of a temporary unused index to store the key of the new comptoir.
 *  This is useful because at the time of the creation of a comptoir, we do not yet know
 *  the comptoir id, and so the index to store the key
 *
 *  @return                         A string to be used to index the localStorage.
 **/ 
var generateTmpKeyId = function() {
    /* We have to find the first free index for temporary keys in local storage */
    /* We arbitrary set at 100 the max number of temporary keys */
    for (var i=0; i < 100; i++) {
        if (localStorage.getItem(key_id_tmp + i.toString()) == null) {
            return key_id_tmp + i.toString(); 
        }
    }
}

/* isTmp is a param that indicates if we have to save the key 
   from a tmp register to a permanent register */
var keyFound = function(id, isTmp) {
    var private_key = localStorage.getItem(id);
    console.log(private_key);
    if (isTmp) {
        localStorage.setItem(key_id, private_key);
        localStorage.removeItem(id);
    }
    console.log(localStorage.getItem(key_id));
    $("#comptoir-key").val(private_key);
    updateKey(key_id, true);
}

var createKey = function() {
    $("#comptoir-key").text(Generate_key());
    var key_storage = generateTmpKeyId();
    updateKey(key_storage, false);
    $("#key-field-container").removeClass("invisible");
}   
 
$("#generate-key").click(function() {
    createKey();
});


/* CHECKING HASH IN AJAX */

// Constructor of an XMLHttpRequest object
var getXMLHttpRequest = function() {
    var xhr = null;
     
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest(); 
        }
    } else {
        // XMLHttpRequest not supported by the browser
        return null;
    }
     
    return xhr;
}


var checkHash = function(callback, hash, cid) {

    // Creation of an object
    var xhr = getXMLHttpRequest(); 

    // AJAX function on change    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText);
        } else if (xhr.readyState < 4) {
            // The request is in treatment, displaying loader image
            //document.getElementById("loader").style.display = "inline";
        }
    };

    // Initialisation
    xhr.open("GET", "check_hash?cid=" + cid + "&hash=" + hash, true);
    // Sending request
    xhr.send();
}

var checkHashUICallback = function(data) {

    // Hidding loader
    // document.getElementById("loader").style.display = "none";

    // If the server returns False, it means that the username is already used
    if (data === "False") {
        hash_field.parent().removeClass("has-success");
        hash_field.parent().addClass("has-error");
        //$("#" + field + "> div.help-block").html("* Ce pseudo est déjà utilisé.");
    } else {
        hash_field.parent().removeClass("has-error");
        hash_field.parent().addClass("has-success");
        //$("#" + field + "> div.help-block").html("Ce pseudo est disponible.");
    }
}


var tryNextTmpKey;

var checkHashCallback = function(data) {
    if (data === "False") {
        tryNextTmpKey()
    } else {
        keyFound(key_id_tmp + tmp_id.toString(), true);
    }
}

var Decrypt_all = function() {
    $(".message").each(function() {
        ciph = $( this ).find(".ciphered").text();
        if (ciph != "") {
            $( this ).find(".clear").text(Decrypt_Text(ciph, localStorage.getItem(key_id)));
        }
    });
}


var tryNextTmpKey = function() {
    
    do {
        tmp_id++;
    } while (localStorage.getItem(key_id_tmp + tmp_id.toString()) == null && tmp_id < 100);

    if (tmp_id == 100) {
        return;
    }

    console.log(tmp_id);

    hash = CryptoJS.SHA3(localStorage.getItem(key_id_tmp + tmp_id.toString())); 
    checkHash(checkHashCallback, hash, $("#cid").val());

}

var findKey = function() {
    if (localStorage.getItem(key_id) != null) {
        keyFound(key_id, false);
    } else {
        tryNextTmpKey();
    }
}
//  var update_key = function() {
//      localStorage.setItem(key_id, $("#comptoir-key").val());
//      var comptoir_key_hash = CryptoJS.SHA3(localStorage.getItem(key_id));
//      $("#comptoir-key-hash").val(comptoir_key_hash);
//      Decrypt_all();
//      $("#comptoir-key-container").addClass("form-group");
//      checkHash(checkHashUICallback, hash_field.val(), $("#cid").val());
//  }
 
$("#comptoir-key").change(function() {
     updateKey(key_id, true);
     Decrypt_all();
     checkHash(checkHashUICallback, hash_field.val(), $("#cid").val());
});

// $("#generate-key").click(function() {
//     $("#comptoir-key").val(Generate_key());
//     update_key();
// });

var init = function() {
    
    /* This function checks if there is a key set up either on 
       the key register associated to this comptoir, or in some
       temporary register in case this is the first connection since the
       creation of the comptoir */
    findKey();
    checkHash(checkHashUICallback, hash_field.val(), $("#cid").val());

    $("#comptoir-key").val(localStorage.getItem(key_id));
    updateKey(key_id, true);
    Decrypt_all();
}

init();
