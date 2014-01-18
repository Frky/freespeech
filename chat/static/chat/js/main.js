
$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);

var Decrypt_all = function() {
    $(".message").each(function() {
        ciph = $( this ).find(".ciphered").text();
        if (ciph != "") {
            $( this ).find(".clear").text(Decrypt_Text(ciph, localStorage.getItem(key_id)));
        }
    });
}

var key_id = "comptoir_key_" + $("#cid").val();

var update_key = function() {
    localStorage.setItem(key_id, $("#comptoir-key").val());
    var comptoir_key_hash = CryptoJS.SHA3(localStorage.getItem(key_id));
    $("#comptoir-key-hash").val(comptoir_key_hash);
    Decrypt_all();
}

$("#comptoir-key").change(update_key);
$("#generate-key").click(function() {
    $("#comptoir-key").val(Generate_key());
    update_key();
});

$("#comptoir-key").val(localStorage.getItem(key_id));
update_key();

