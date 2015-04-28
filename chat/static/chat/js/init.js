
// 
// /* Initialisation of the help popovers */
// $(".fsp-popover").popover();
// /* Initialisation of the tooltips */
// $('.fsp-tooltip').tooltip();
// 
// $(".td-sound").click(function() {
//     $(".toggle-sound", this).toggleClass("glyphicon-volume-up");
//     $(".toggle-sound", this).toggleClass("glyphicon-volume-off");
// });
// 
// 
// $('input[name=public]').on('change', function() {
//     $("#comptoir-form .private-part").toggleClass('invisible');
// });
// $('#comptoir-list li').on('click', function() {
//     $(this).next('.detail').toggleClass('hidden');
// })
// 
// /* Initialisation of the slimscroll */
// /*
// $('#my-comptoirs .list').slimScroll({
//     width: 'auto',
//     height: '160px',
//     position: 'right',
//     size: '4px',
//     color: '#428bca',
//     railColor: '#222',
//     railOpacity: 0.1,
//     wheelStep: 8,
//     railVisible: true
// });
// $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
// */
// 
// /* Initialisation of the switch button for sound alerts */
// $("[name='sound-alert']").bootstrapSwitch();
// $("#sound-alert-btn").on('switchChange', function() {
//     $("#sound-alert-btn").val(1 - $("#sound-alert-btn").val());
// });
// 
// /* Initialisation of the switch button for notifications */
// $("[name='notif-alert']").bootstrapSwitch();
// $("#notif-alert-btn").on('switchChange', function() {
//     $("#notif-alert-btn").val(1 - $("#notif-alert-btn").val());
// });
// 
// /* Initialisation of flash copy to clipboard */
// var urlcpy = new ZeroClipboard( document.getElementById("copy-url-button"), {
//     moviePath: "{% static 'chat/flash/ZeroClipboard.swf' %}"
// } );
// 
// urlcpy.on( 'dataRequested', function (client, args) {
//     client.setText(window.location.href);
// });
// 
// urlcpy.on( "load", function(client) {
//     client.on( "complete", function(client, args) {
//         pop_alert("info", "Comptoir address copied to clipboard. Share it!");
//     } );
// } );
// 
// var keycpy = new ZeroClipboard( document.getElementById("copy-key-button"), {
//     moviePath: "{% static 'chat/flash/ZeroClipboard.swf' %}"
// } );
// 
// keycpy.on( 'dataRequested', function (client, args) {
//     client.setText($("#comptoir-key").val());
// });
// 
// keycpy.on( "load", function(client) {
//     client.on( "complete", function(client, args) {
//         pop_alert("info", "Comptoir key copied to clipboard. Share it!");
//     } );
// } );

$(window).resize(rearrange);
$(document).ready(function() {

    /* General UI initialisation */
    /* Register form */
    $("#register-button").click(function() {
        $("#register-panel").toggleClass("visible");
        $("#login-panel").removeClass("visible");
    });
    /* Log in form */
    $("#login-button").click(function() {
        $("#login-panel").toggleClass("visible");
        $("#register-panel").removeClass("visible");
    });
    /* Main panel */
    $('#menu-button').on('click', function() {
        $(this).toggleClass('active');
        $('#extra-panel-button').removeClass('active');
        $('aside').toggleClass('visible');
        $('#extra-panel').removeClass('visible');
        $('#main-content-wrapper').removeClass('wrap');
        if ($(this).hasClass('active')) {
            $('#main-content-wrapper').addClass('wrap');
        }
    });
    $('#extra-panel-button').on('click', function() {
        $('#menu-button').removeClass('active');
        $(this).toggleClass('active');
        $('#extra-panel').toggleClass('visible');
        $('aside').removeClass('visible');
        $('#main-content-wrapper').removeClass('wrap');
        if ($(this).hasClass('active')) {
            $('#main-content-wrapper').addClass('wrap');
        }
    });
    /* Hints management */
    $('.hint.betakey').hide()
    $("#beta_key").on('focusin', function() {
        $('.hint.betakey').show()
    }).on('focusout', function() {
        $('.hint.betakey').hide()
    });
    /* Comptoir creation form */
    $("#comptoir-form").submit(function(e) {
        e.preventDefault();
        submit_cform(this);
    });

    /* Init key management UI elements */
    init_key_management_fields();

    /* Init panel UI elements */
    init_ui_panel();
    /* Deciphering all comptoir names in panel */
    $(".ciphered", "#my-comptoirs").each(function() {
        cid = $(this).attr("id").substring(3); // $(".cmptr-link", this).text().trim();
        cname = $("span.txt", this).text();
        ckey = get_key(cid);
        if (ckey === null || ckey == "" || ckey == "undefined") { 
            ckey = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        }
        clear_title = Decrypt_Text(cname, ckey);
        $("span.txt", this).text(clear_title);
    });

    /* Depending on the location */
    if (window.location.pathname == "/") {
        /* Button to generate new key */
        $("#generate-key").click(create_key);
    }

    /* Connecting web socket */
    init_socket();

    /* UI relative to comptoir page */
    if ($("#chatbox").length > 0) {
        $("#send-form").removeClass("hidden");
        stats_init();
        key_init();
        init_cmptr();
    }

        /* OBSOLETE WITH NEW DESIGN ?
        $("#plus a").click(function() {
            $("#comptoir-form").toggleClass("hidden");
            $('#plus').toggleClass("toggle");
        });
        */
        /*
        $("#public input").on("change", function() {
            if ($(this).val() == "off") {
                $("#manage-key-container").toggleClass("invisible");
                $("#note").toggleClass("invisible");
                createKey();
                $("#id_key_hash-container").addClass("invisible");
                $("#key-field-container").addClass("invisible");
                $("#generate-key-container").addClass("invisible");
            } else {

            }
        })
        $('#public-btn').on('switchChange', function () {
            $("#public-btn").val(1 - $("#public-btn").val());

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
    }
    */


    /*
    $(".panel-tabs .tab-area").each(function() {
        $(this).click(function() {
            $(".active-init").removeClass("active-init");
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
    */


    /*particlesJS('particle', {
        particles: {
            color: '#fff',
            shape: 'circle', // "circle", "edge" or "triangle"
            opacity: 0.5,
            size: 2,
            size_random: true,
            nb: 50,
            line_linked: {
                enable_auto: true,
                distance: 250,
                color: '#fff',
                opacity: 0.5,
                width: 1,
                condensed_mode: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 600
                }
            },
            anim: {
                enable: true,
                speed: 2
            }
        },
        interactivity: {
            enable: false,
            mouse: {
                distance: 250
            },
            detect_on: 'canvas', // "canvas" or "window"
            mode: 'grab'
        },
        retina_detect: false
    });*/

    rearrange();

});
