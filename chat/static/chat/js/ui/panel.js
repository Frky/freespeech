
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

var rearrange = function() {
    if ($(window).width() < 1300) {
        var from = $(".cmptr__right");
        var to = $("#extra-panel");
    } else {
        var from = $("#extra-panel");
        var to = $(".cmptr__right");
    }
    if (from.hasClass('enabled')) {
        from.removeClass("enabled");
        to.addClass("enabled");
        to.html($("section", from).clone());
        from.html("");
        init_key_management_fields();
    }
}

var add_link = function(link, auth_is_me) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    link = linkify(urlRegex.exec(link)[1]);
    var auth_cls;
    if (auth_is_me) {
        auth_cls = "myself";
    } else {
        auth_cls = "other";
    }
    $(".content", "#cmptr-links").append("<p class=\"" + auth_cls + "\">" + link + "</p>");
    $("#cmptr-links").removeClass("hidden");
}
