
var init_ui_panel = function() {
    $(".toggle-sound").click(function() {
        $(this).toggleClass("glyphicon-volume-up");
        $(this).toggleClass("glyphicon-volume-off");
    });

    $(".toggle-hist").click(function() {
        $(this).toggleClass("glyphicon-floppy-saved");
        $(this).toggleClass("glyphicon-floppy-remove");
    });

    $(".cmptr-link").click(function () {
        /* Get the comptoir id we need to load */
        var cid =  $(this).attr("value");
        /* If the user is clicking on the current comptoir, 
           do nothing */
        if (cid == $("#cid").val())
            return;
        /* If we already are on a comptoir page */
        if ($("#chatbox").length > 0) {
            /* We get the new comptoir asynchronously */
            jQuery.get("ajax-" + cid, function(data) {
                    ajax_cmptr_callback(data, cid)
            });
        } else {
            /* Else we get it with a get request */
            window.location.href = cid;
        }
    });
}
