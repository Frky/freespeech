
/* Initialisation of the help popovers */
$(".fsp-popover").popover();
/* Initialisation of the tooltips */
$('.fsp-tooltip').tooltip();

/* Initialisation of interactive menus */
$("#login-button").click(function() {
    $("#login-form").toggleClass("hidden");
    $("#register-form").addClass("hidden");
});

$("#register-button").click(function() {
    $("#register-form").toggleClass("hidden");
    $("#login-form").addClass("hidden");
});

$("#user-name").click(function() {
    $("#my-comptoirs").toggleClass("hidden");
});


$(".td-sound").click(function() {
    $(".toggle-sound", this).toggleClass("glyphicon-volume-up");
    $(".toggle-sound", this).toggleClass("glyphicon-volume-off");
});


/* Initialisation of the slimscroll */
/*
$('#my-comptoirs .list').slimScroll({
    width: 'auto',
    height: '160px',
    position: 'right',
    size: '4px',
    color: '#428bca',
    railColor: '#222',
    railOpacity: 0.1,
    wheelStep: 8,
    railVisible: true
});
$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
*/

/* Initialisation of the switch button for sound alerts */
$("[name='sound-alert']").bootstrapSwitch();
$("#sound-alert-btn").on('switchChange', function() {
    $("#sound-alert-btn").val(1 - $("#sound-alert-btn").val());
});

/* Initialisation of the switch button for notifications */
$("[name='notif-alert']").bootstrapSwitch();
$("#notif-alert-btn").on('switchChange', function() {
    $("#notif-alert-btn").val(1 - $("#notif-alert-btn").val());
});

/* Initialisation of flash copy to clipboard */
var urlcpy = new ZeroClipboard( document.getElementById("copy-url-button"), {
    moviePath: "{% static 'chat/flash/ZeroClipboard.swf' %}"
} );

urlcpy.on( 'dataRequested', function (client, args) {
    client.setText(window.location.href);
});

urlcpy.on( "load", function(client) {
    client.on( "complete", function(client, args) {
        pop_alert("info", "Comptoir address copied to clipboard. Share it!");
    } );
} );

var keycpy = new ZeroClipboard( document.getElementById("copy-key-button"), {
    moviePath: "{% static 'chat/flash/ZeroClipboard.swf' %}"
} );

keycpy.on( 'dataRequested', function (client, args) {
    client.setText($("#comptoir-key").val());
});

keycpy.on( "load", function(client) {
    client.on( "complete", function(client, args) {
        pop_alert("info", "Comptoir key copied to clipboard. Share it!");
    } );
} );

$(document).ready(function() {

    /* Resize micro picture if too large */
    max_micro_height = $("body").height() - 200;
    $("#aside-bg").css({"background-size": "auto " + max_micro_height + "px"});
    $("#aside-bg").removeClass("invisible");

    /* Depending on the location */
    if (window.location.pathname == "/") {
        $("#plus a").click(function() {
            $("#comptoir-form").toggleClass("hidden");
            $('#plus').toggleClass("toggle");
        });
        $("[name='public']").bootstrapSwitch();
        $('#public-btn').on('switchChange', function () {
            $("#public-btn").val(1 - $("#public-btn").val());
            $("#manage-key-container").toggleClass("invisible");
            $("#note").toggleClass("invisible");
            createKey();
            $("#id_key_hash-container").addClass("invisible");
            $("#key-field-container").addClass("invisible");
            $("#generate-key-container").addClass("invisible");
        });
        $("#manage-key").click(function() {
            $("#id_key_hash-container").toggleClass("invisible");
            $("#key-field-container").toggleClass("invisible");
            $("#generate-key-container").toggleClass("invisible");
        });
        $("aside").addClass("micro");
    } else if ($("#chatbox").length > 0) {

        $("#content").addClass("cmptr-page");

        $("#option-panel").removeClass("hidden");
        $("#option-panel-tab").removeClass("hidden");
        $("#send-form").removeClass("hidden");
        key_init();
        init_cmptr();
    }
        $(".panel-tabs .tab-area").each(function() {
            $(this).click(function() {
                var tab_content = $(".tab", this).attr("href");
                if (!$(tab_content).hasClass("active")) {
                    $("#aside-panel .active").each(function() {
                        $(this).removeClass("active");
                    });
                }
                $(this).toggleClass("active");
                $(tab_content).toggleClass("active");
            });
        });
});
