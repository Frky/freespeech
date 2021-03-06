
var msg_alert;
var sound_alert;
var last_left;
var last_joined;
/* Number of unread messages (all comptoirs included) */
var unread = 0;
/* List of online users */
var online = new Array();

var page_title = "Freespeech";


var scroll_down = function(animation) {
    var d = $(".content", "#chatbox");
    if (animation) {
        $(".content", "#chatbox").ready(function() {
                $("div:last", "#chatbox .content").velocity("scroll", 
                { 
                    duration: 1000,
                    container: $("#chatbox .content")
                });
        });
    } else {
        d.ready(function() {
           d.scrollTop(d.prop("scrollHeight")); 
        });
    }
}

var delayed_sound = function(type, cid) {
    if (type == "joined") {
        joined_alert.play();
    }
}

var update_title = function() {
    if (unread == 0) {
        $("#favicon").attr("href","static/chat/images/favicon.png");
        $("#menu-badge").addClass("hidden");
        document.title = page_title;
    } else {
        $("#favicon").attr("href","/static/chat/images/favicon_new.png");
        $("#menu-badge").text(unread);
        $("#menu-badge").removeClass("hidden");
        document.title = "(" + unread + ") " + page_title;
    }
}


var sound_notification = function(type, cid) {
    /* If the global control of the sound is off, we return */
    if (!sound_alert.is(":checked")){
        return;
    }

    /* If this is a comptoir notification and the sound of this comptoir 
       is off, then we return */
    if (cid != "" && !($(".toggle-sound", "#my-" + cid).hasClass("glyphicon-volume-up"))) {
        return;
    }

    if (type == "msg" && !document.hasFocus()) {
        msg_alert.play();
        return;
    }
    if (type == "wizz") {
        wizz_alert.play();
    }
    if (type == "left") {
        left_alert.play();
    }
    if (type == "joined") {
        if (last_left == last_joined) {
            return;
        }
        joined_alert.play();
    }
}




/* Function to add a new '/me' message to the chat box.
 * Called at each reception of a message of this type through the socket */
var addMeMessage = function(user, cipher, clear, msgdate, mid, insert) {

    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    var new_message = "<div data-author=\"" + user + "\">";
    new_message += "<div colspan=\"3\" class=\"message central-msg me\">";
    new_message += "<span class=\"author\">" + user + "</span>\n";
    new_message += "<span class=\"clear\">" + clear + "</span>";
    new_message += "<span class=\"ciphered hidden\">" + cipher + "</span>";
    new_message += "</div>";
    new_message += "</div>";

    if (insert) {
        /* Append the new message to the chatbox */
        $("#chatbox table tbody").append(new_message)
        
        /* NOTE: for now, no edition/deletion is possible for /me messages */
        // msg_management_init($(".message:last-child", "tr:last-child", "#chatbox"));

        /* NOTE: For now, no date tooltip on /me messages */
        // $('.fsp-tooltip').tooltip('destroy').tooltip();

        /* Notification to the sound alert manager */
        if (user != $("#user-name").html()) {
            sound_notification("msg");
        }

    } else {
        return new_message;
    }
}


/* Function to add a new message to the chat box.
 * Called at each reception of a message through the socket */
var addMessage = function(user, cipher, clear, msgdate, mid, insert, me_msg, pending_msg) {
    
    /* First check if this is a pending message */
    if (user == $("#user-name").text()) {
        console.log("Hm ...");
        $(".pending").each(function() {
            console.log(cipher + " vs. " + $(".ciphered", this).text());
            if ($(".ciphered", this).text() == cipher) {
                $(".message", this).attr("id", mid);
                $(".date", this).text(msgdate);
                $(this).removeClass("pending");
            }
        });
    }
    if ($("#" + mid).length > 0) return;

    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    clear = msgify(clear);

    /* Check for link in text */
    if (contains_link(clear)) add_link(clear, user == $("#user-name").text());

    var auth_div, msg_div;
    
    var last_user = $("#chatbox .content .message:not(.pending):last").parent().attr("data-author");
    /* If the new message is NOT from the same user as the previous one, 
       we need to display the nickname of the new user */
    if (last_user != user && !me_msg) {
        /* Fetch username template */
        auth_div = $(".author", "#tpl-author").clone();
        $(".user", auth_div).text(user);
        if (user == $("#user-name").html()) {
            $(auth_div).addClass("myself");
        } else {
            $(auth_div).addClass("other");
        }
    } else {
        auth_div = "";
    }

    if (me_msg) {
        msg_div = $(".central-msg", "#tpl-central").clone();
        $("span", msg_div).html(clear);
    } else {
        /* Fetch message template */
        msg_div = $(".msg-div", "#tpl-msg-myself").clone();
        $(msg_div).removeClass("msg-div");
        $(msg_div).attr("data-author", user);
        $(".message", msg_div).attr("id", mid);
        $(".clear", msg_div).html(clear);
        $(".ciphered", msg_div).text(cipher);
        $(".date", msg_div).text(msgdate);
    }

    if (user == $("#user-name").html()) {
        $(msg_div).addClass("myself");
        add_glyphicons(msg_div); 
    } else {
        $(msg_div).addClass("other");
    }
        
    if (pending_msg) {
        if (auth_div != "") {
            $(".user", auth_div).addClass("pending");
        }
        $(msg_div).addClass("pending");
    }

    if (insert) {
        if (auth_div === "") {
            $("div[data-author=\"" + user + "\"]:last", "#chatbox .content").append($(msg_div));
        } else {
            /* Append the user to the chatbox */
            $("#chatbox .content").append($(auth_div));
            /* Append the new message to the chatbox */
            $("#chatbox .content").append($(msg_div));
        }
        /* Scroll down */
        scroll_down(true);
        /* Increase nb of messages */
        incr_msg();
        msg_management_init($(msg_div));

        /* Notification to the sound alert manager and update window title */
        if (user != $("#user-name").html()) {
            if (!document.hasFocus()) {
                update_badge($("#cid").val(), null, null);
            }
            sound_notification("msg", $("#cid").val());
        }

    } else {
        return auth_div + msg_div;
    }

}

var join_comptoir = function() {
    data = {action: "join", cid: $("#cid").val(), session_key: $('#session_key').val()};
    socket.send(data);
    return;
}


/* Connect the socket to the server with the comptoir id, 
   to be alerted on new messages posted on this comptoir */
var connected = function() {
    socket.subscribe("freespeech");
    data = {action: "identification", session_key: $('#session_key').val()};
    socket.send(data);
    join_comptoir();
    return;
}


/* Unrelevant for now */
var entityMap = {
    "À": "&Agrave;",
    "à": "&agrave;",
    "Â": "&Acirc;",
    "â": "&acirc;",
    "Ä": "&Auml;",
    "ä": "&auml;",
    "É": "&Éacute;",
    "é": "&eacute;",
    "È": "&Ègrave;",
    "è": "&egrave;",
    'Ù': "&Ugrave;",
    'ù': "&Ugrave;",
  };

var escapeHtml =  function (text) {
    return String(text).replace(/[ÀàÂâÄäÉéÈèÙù]/g, function (s) {
        return entityMap[s];
    });
}

var message_pending = false;

var disable_sendbox = function() {
    $("#new-msg").attr('disabled', true);
    message_pending = true;
}

var enable_sendbox = function() {
    /* Cleaning the input field */
    $("#new-msg").val("");
    $("#new-msg").attr('disabled', false);
    $("#new-msg").focus();
    message_pending = false;
}

var send_wizz = function() {
    data = {cid: $("#cid").val(), action: "wizz", hash: $("#comptoir-key-hash").val(), session_key: $('#session_key').val()};
    socket.send(data);
}

/*
var meify = function(el) {
    var author = el.data("author"); 
    el.html("<td colspan=\"3\" class=\"message central-msg me\"></td");
    
    console.log(author);
}*/


var message_timeout = function() {
    if (!message_pending) {
        return;
    }
    message_pending = false;
    $("#new-msg").attr('disabled', false);
    $("#new-msg").focus();
    pop_alert("danger", "Your message has not been posted. You may have lost connection with the server.");
}


var replace_message = function(mid, newcipher, newclear) {
    var msg_div = $("#" + mid, "#chatbox");
    $(".ciphered", msg_div).html(newcipher);
    $(".clear", msg_div).html(newclear);
    if (newcipher == "") {
        $(msg_div).addClass("deleted");
        $(msg_div).find(".glyphicon-options").remove();
        $(msg_div).find(".glyphicon-pencil").remove();
        return;
    }
    $(".clear", msg_div).html(newclear);
    if ($(msg_div).hasClass("edited"))
        return;
    $(msg_div).addClass("edited");
    $(msg_div).append(glyph_edited);
}


/* Function to submit a new message through the socket */
var submit_msg = function() {
    /* The data contains:
            - the comptoir_id
            - the message encrypted with the secret key stored in the localStorage
            - a session key
            - the hash of the secret key, to allow the server to check that we indeed are allowed to 
            post on this comptoir
    */
    var msg = $("#new-msg").val();
    switch (msg) {
        case "":
            return;
            break;
        case "/wizz":
            send_wizz();
            $("#new-msg").val("");
            break;
        default:
            disable_sendbox();
            /* Boolean to indicate if it is a '/me' message */
            var me_msg = false
            /* Looking for '/me' substring */
            if (msg.substring(0, 4) == "/me ") {
                /* In this case, updating the boolean */
                me_msg = true;
                /* Removing the substring '/me ' */
                msg = msg.slice(4);
            }
            /* Creating the data to be sent to the server */
            data = {cid: $("#cid").val(), action: "post", content: Encrypt_Text(msg, localStorage.getItem(key_id)), session_key: $('#session_key').val(), hash: $("#comptoir-key-hash").val(), me_msg: me_msg};
            /* Sending data */
            socket.send(data);
            /* Set timeout to raise an error if no ack was received from server within 3s */
            setTimeout(message_timeout, 3000);
            break;
    }

}

var keep_history = function(cid) {
    return $(".keep-history", "#my-" + cid).is(':checked');
}

/* Remember ctrl pressed to distinguish 
   Enter for submission and Enter for a line feed */
var ctrl_pressed = false;


var reset_badge = function(cid) {
    if ($(".badge", "#my-" + cid).length == 0) {
        return;
    } else {
        var val = parseInt($(".badge", "#my-" + cid).text());
        console.log(val);
        $(".badge", "#my-" + cid).remove();
        unread -= val;
    }
    update_title();
}

var update_badge = function(cid, user, date) {
    if ($(".badge", "#my-" + cid).length == 0) {
        $("#my-" + cid).append("<span class=\"badge\">1</span>");
    } else {
        var val = parseInt($(".badge", "#my-" + cid).text());
        $(".badge", "#my-" + cid).text(val + 1);
    }
    unread += 1;
    update_title();
}


var online_to_string = function(online) {
    str = "";
    for (var i=0; i < online.length; i++) {
        if (online[i] == "") continue;
        str += online[i];
        if (online.length > 1 && i < online.length - 1) {
            str += " ; ";
        }
    }
    return str;
}

var conline_div = ".online_users";

var add_user_online = function(username, cid, sound) {
    var comptoir = "#my-" + cid;
    /*
    if (comptoir == $("#cid").val()) {
        // online = online_div.text().split(", ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        online_div.text(online_to_string(online));
    }
    */

    if (username != $("#user-name").text()) {
        online = $(conline_div, comptoir).text().split(" ; ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        $(conline_div, comptoir).text(online_to_string(online));
        $(conline_div, comptoir).addClass("not-empty");
        if (sound) {
            last_joined = username;
            sound_notification("joined", cid);
        }
    }
}

var remove_user_online = function(username) {
    var comptoir = "#my-" + cid;
    var online_div = $(conline_div, "#my-comptoirs");
    /*
    if (comptoir == $("#cid").val()) {
        // online = online_div.text().split(", ");
        if (online.indexOf(username) != -1) {
            online.splice(online.indexOf(username), 1);
        }
        online_div.text(online_to_string(online));
    }
    */
    if (username != $("#user-name").text()) {
        online_div.each(function() {
            var online = $( this ).text().split(" ; ");
            if (online.indexOf(username) != -1) {
                online.splice(online.indexOf(username), 1);
            }
            $( this ).text(online_to_string(online));
            if (online.length == 0)
                $( this ).removeClass("not-empty");
            else 
                console.log(online);
        });
    }
}

var wizz = function(user, cid) {
    /* Notification to the sound alert manager */
    sound_notification("wizz", cid);
    /* Shaking the chatbox */
    $("#chatbox .content").velocity("callout.shake", "500");//, "1500ms", "true");
    /* Add message on chatbox if current comptoir */
    if (cid = $("#cid").val()) {
        var wizz_div = $(".wizz-div", "#tpl-wizz").clone();
        $(wizz_div).removeClass("wizz-div");
        $(wizz_div).attr("data-author", user);
        if (user == $("#user-name").html()) {
            $(wizz_div).addClass("myself");
        } else {
            $(wizz_div).addClass("other");
        }
        $(".wizz span", wizz_div).text(user + " sent a wizz.");
        $("#chatbox .content").append(wizz_div);
    }
    scroll_down(true);
    incr_wizz();
    return;
}

var decipher_cmptr_info = function(key) {
    if (key == "") {
        key = $("#comptoir-key").val(); 
    }
    if (typeof(key) == "undefined") {
        key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    }
    if ($("#cmptr-info").hasClass("ciphered")) {
        /* Deciphering title */
        ciphered_title = $(".title .ciphered", "#cmptr-info").text();
        key_save = key;
        clear_title = Decrypt_Text(ciphered_title, key);
        key = key_save;
        $(".title .clear", "#cmptr-info").text(clear_title);

        /* Deciphering description */
        ciphered_desc = $(".desc .ciphered", "#cmptr-info").text();
        key = $("#comptoir-key").val(); 
        if (typeof(key) == "undefined") {
            key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        }
        clear_desc = Decrypt_Text(ciphered_desc, key);
        $(".desc .clear", "#cmptr-info").text(clear_desc);
    }

}


var update_chatbox_msg = function(msg) {
    $(".msg", "#chatbox-msg").text(msg);
}


var disable_chatbox_msg = function() {
    $("#chatbox").removeClass("hidden");
    $("#send-form").removeClass("hidden");
    $("#chatbox-msg").addClass("hidden");
    $("#key-mirror").addClass("hidden");
}


var enable_chatbox_msg = function() {
    $("#chatbox").addClass("hidden");
    $("#send-form").addClass("hidden");
    $("#chatbox-msg").removeClass("hidden");
    $("#key-mirror").addClass("hidden");
}


var enable_chatbox_msg_input = function() {
    $("#key-mirror").removeClass("hidden");
}


var init_cmptr = function() {
        $(window).focus(function() {
            reset_badge($("#cid").val());
            setTimeout(clear_noties, 7000);
        });

        msg_alert = $("#msgAlert")[0];
        left_alert = $("#leftAlert")[0];
        joined_alert = $("#joinedAlert")[0];
        sound_alert = $("#global-sound");
        wizz_alert = $("#wizzAlert")[0];

        /* Submission with "Enter" key ; line feed if CTRL */
        $('#new-msg').keydown(function(e){
            if (e.which == 13 && !e.ctrlKey){
                if (!e.crtlKey) {
                    e.preventDefault();
                    sendMessage();
                }
            }
        }); 

        unread = 0;

        /* Compute number of unread messages */
        $("li", ".cmptr-link").each(function() {
            /*
            if ($(this).attr("id") == "my-" + $("#cid").val())
                return;
            */
            var ntxt = $(".badge", this);
            if (ntxt != undefined && ntxt.text() != "") {
                unread += parseInt(ntxt.text());
            }
        });
        update_title();

        /*
        var init_sound_plop = false;
        sound_alert.parent().click(function() {
            if (!init_sound_plop) {
                init_sound_plop = true;
                sound_alert.parent().click(function() {
                    console.log("Changing sound.");
                });
            }
            console.log("Changing sound.");
        });
        */
}

