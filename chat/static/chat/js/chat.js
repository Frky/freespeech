
var msg_alert;
var sound_alert;
var last_left;
var last_joined;
/* Number of unread messages (all comptoirs included) */
var unread = 0;
/* List of online users */
var online = new Array();

var page_title = "Freespeech";

var delayed_sound = function(type, cid) {
    if (type == "joined") {
        joined_alert.play();
    }
}

var update_title = function() {
    if (unread == 0) {
        $("#favicon").attr("href","static/chat/images/favicon.png");
        document.title = page_title;
    } else {
        $("#favicon").attr("href","/static/chat/images/favicon_new.png");
        document.title = "(" + unread + ") " + page_title;
    }
}


var sound_notification = function(type, cid) {
    /* If the global control of the sound is off, we return */
    /*
       TODO
    if (sound_alert.val() == 0) {
        return;
    }
    */

    /* If this is a comptoir notification and the sound of this comptoir 
       is off, then we return */
    if (cid != "" && !($(".toggle-sound", "#my-" + data.cid).hasClass("glyphicon-volume-up"))) {
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
var addMessage = function(user, cipher, clear, msgdate, mid, insert) {
    
    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    clear = msgify(clear);

    var template = $(".msg-div", "#tpl-msg-myself").clone();
    $(template).removeClass("msg-div");
    $(template).attr("data-author", user);
    $(".message", template).attr("id", mid);
    $(".clear", template).html(clear);
    $(".ciphered", template).text(cipher);
    if (user == $("#user-name").html()) {
        $(template).addClass("myself");
    } else {
        $(template).addClass("other");
    }
        
    var last_user = $("#chatbox .content span.user:last").text()

    /* If the new message is NOT from the same user as the previous one, 
       we need to display the nickname of the new user */
        /*
    if (last_user != user) {
        new_user = true;
        new_message += '<div class="author"><div>';
        if (user != $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</div><div class="nopoint"></div><div>';
        if (user === $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</div></div>';
    }
        */

    if (insert) {
        /* Append the new message to the chatbox */
        $("#chatbox .content").append($(template));
        /* Scroll down */
        $(".message:last", "#chatbox .content").velocity("scroll", { duration: 1000, container: $("#chatbox .content")});
        /* TODO réactiver ceci */      
//        msg_management_init($(".message:last-child", "tr:last-child", "#chatbox"));

        /* Notification to the sound alert manager and update window title */
        if (user != $("#user-name").html()) {

            if (!document.hasFocus()) {
                unread += 1;
                update_title();
            }
            sound_notification("msg", data.cid);
        }

    } else {
        return template;
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
    $(".ciphered", ".message#" + mid).html(newcipher);
    if ($(".message#" + mid).is(":first-child")) {
        if ($("span.glyphicon-pencil", ".message#" + mid).length == 0) {
            $(".message#" + mid).append(glyph_edited);
        }
    } else {
        if ($("span.glyphicon-pencil", ".message#" + mid).length == 0) {
            $(".message#" + mid).prepend(glyph_edited);
        }
    }
    $(".clear", ".message#" + mid).html(newclear);
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


var update_badge = function(cid, user, date) {
    if ($(".badge", "#my-" + cid).length == 0) {
        $("#my-" + cid).append("<span class=\"badge\">1</span>");
    } else {
        var val = parseInt($(".badge", "#my-" + cid).text());
        $(".badge", "#my-" + cid).text(val + 1);
    }
    unread += 1;
    update_title();
//    $(".fsp-tooltip", "#my-" + cid).attr("data-original-title", "Last message by " + user +"<br />(" + date +")").tooltip('fixTitle');
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

var add_user_online = function(username, cid) {
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
        console.log("Adding user " + username + " at comptoir " + comptoir);
        online = $(conline_div, comptoir).text().split(" ; ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        $(conline_div, comptoir).text(online_to_string(online));
    }
    $(conline_div, comptoir).addClass("not-empty");
}

var remove_user_online = function(username, cid) {
    var comptoir = "#my-" + cid;
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
        console.log("Removing user " + username + " at comptoir " + comptoir);
        online = $(conline_div, comptoir).text().split(" ; ");
        if (online.indexOf(username) != -1) {
            online.splice(online.indexOf(username), 1);
        }
        $(conline_div, comptoir).text(online_to_string(online));
        if (online.length == 0)
            $(conline_div, comptoir).removeClass("not-empty");
    }
}

var wizz = function(user, cid) {
    /* Notification to the sound alert manager */
    sound_notification("wizz", cid);
    /* Shaking the chatbox */
    // TODO
    // $("#chatbox").velocity("callout.shake", "500ms", "true");
    /* Add message on chatbox if current comptoir */
    if (cid = $("#cid").val()) {
        $("#chatbox table tbody").append("<tr><td colspan=\"3\" class=\"central-msg wizz\">" + user + " sent a wizz.</td></tr>");
        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
    }
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
        console.log(ciphered_title);
        console.log(key);
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

var init_cmptr = function() {
        $(window).focus(function() {
            unread = 0;
            update_title();
        });

        msg_alert = $("#msgAlert")[0];
        left_alert = $("#leftAlert")[0];
        joined_alert = $("#joinedAlert")[0];
        sound_alert = $("#sound-alert-btn");
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

        $("#edit-msg-box").keydown(function(e){
            if (e.which == 13 && !e.ctrlKey){
                if (!e.crtlKey) {
                    e.preventDefault();
                    pre_edition();
                }
            }
        });
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

        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
        // msg_management_init_all();
}

