
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
    if (sound_alert.val() == 0) {
        return;
    }
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

    /* Tooltip for the date of the msg. For the client, 
       displayed in left ; for others in right */
    var tooltip_placement = function(user) {
        if (user != $("#user-name").html()) return "right";
        else return "left";
    }

    var new_message = ""

    /* Getting the last user to post a message */
    var last_date = $("#chatbox table tbody td.point:last a").attr("data-original-title");

    var last_user = $("#chatbox table tbody td span.user:last").text()

    /* Boolean to indicate if the last message was from a new user */
    var new_user = false;

    /* If the new message is NOT from the same user as the previous one, 
       we need to display the nickname of the new user */
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

    new_message += '<div>';

    if (user != $("#user-name").html()) {
        new_message +=  '<div class="message" id="' + mid + '"><span class="clear">' + clear + '</span><span class="ciphered hidden">"' + cipher + '</span></div>';
    } else {
        new_message +=  '<div></div>';
    }

    /* If the message is from the same user and the date is the same, we do not include a tooltip */
    if (!new_user && last_date === msgdate) {
        new_message += '<div class="nopoint"></div>';
    /* Otherwise, we need to add the date of the message */
    } else {
        new_message += '<div class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="' + tooltip_placement(user) + '" rel="tooltip"> • </a></div>';
    }

    if (user != $("#user-name").html()) {
        new_message += '<div></div>';
    } else {
        new_message += '<td class="message" id="' + mid + '"><span class="clear">' + clear + '</span><span class="ciphered hidden">' + cipher + '</span>';
//        new_message = add_glyphicons(new_message);
        new_message += "</div>";
    }

    new_message += '</div>';
    
    if (insert) {
        /* Append the new message to the chatbox */
        $("#chatbox .content").append(new_message)
        /* TODO réactiver ceci */      
//        msg_management_init($(".message:last-child", "tr:last-child", "#chatbox"));

        $('.fsp-tooltip').tooltip('destroy').tooltip();

        /* Notification to the sound alert manager and update window title */
        if (user != $("#user-name").html()) {

            if (!document.hasFocus()) {
                unread += 1;
                update_title();
            }
            sound_notification("msg", data.cid);
        }

    } else {
        return new_message;
    }

}

var join_comptoir = function() {
    data = {action: "join", cid: $("#cid").val(), session_key: $('#session_key').val()};
    socket.send(data);
    $(".badge", "#my-" + $("#cid").val()).remove();
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

/* Handler for the submission of the form */
$("#send-form").submit(function(event) {
    event.preventDefault();
    submit_msg();
});



/* Remember ctrl pressed to distinguish 
   Enter for submission and Enter for a line feed */
var ctrl_pressed = false;

var bind_keys = function() {

}


var update_badge = function(cid, user, date) {
    if ($(".badge", "#my-" + cid).length == 0) {
        $("td.td-name", "#my-" + cid).append("<span class=\"badge active\">1</span>");
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
            str += ", ";
        }
    }
    return str;
}

online_div = $("#users-connected");

var add_user_online = function(username, comptoir) {
    if (comptoir == $("#cid").val()) {
        online = online_div.text().split(", ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        online_div.text(online_to_string(online));
    }

    if (username != $("#user-name").text()) {
        online = $(".td-users", "#my-" + comptoir).text().split(", ");
        if (online.indexOf(username) == -1) {
            online.push(username);
        }
        $(".td-users", "#my-" + comptoir).text(online_to_string(online));
    }
}

var remove_user_online = function(username, comptoir) {
    if (comptoir == $("#cid").val()) {
        online = online_div.text().split(", ");
        if (online.indexOf(username) != -1) {
            online.splice(online.indexOf(username), 1);
        }
        online_div.text(online_to_string(online));
    }

    if (username != $("#user-name").text()) {
        online = $(".td-users", "#my-" + comptoir).text().split(", ");
        if (online.indexOf(username) != -1) {
            online.splice(online.indexOf(username), 1);
        }
        $(".td-users", "#my-" + comptoir).text(online_to_string(online));
    }
}

var wizz = function(user, cid) {
    /* Notification to the sound alert manager */
    sound_notification("wizz", cid);
    /* Shaking the chatbox */
    $("#chatbox").velocity("callout.shake", "500ms", "true");
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
        /* TODO reinsert
        $(window).focus(function() {
            unread = 0;
            update_title();
        });

        console.log("Init comptoir");
        msg_alert = $("#msgAlert")[0];
        wizz_alert = $("#wizzAlert")[0];
        left_alert = $("#leftAlert")[0];
        joined_alert = $("#joinedAlert")[0];
        sound_alert = $("#sound-alert-btn");
        */

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

