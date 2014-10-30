/*
    This file manage the connection between the client and the server through web sockets.
*/

var msg_alert;
var sound_alert;
var last_left;
var last_joined;
var unread = 0;

var page_title = "Freespeech";

var delayed_sound = function(type, cid) {


    if (type == "joined") {
        joined_alert.play();
    }

}


var update_title = function() {
    if (unread == 0) {
        document.title = page_title;
    } else {
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


/* Creation of a socket instance */
var socket = new io.Socket();

var online = new Array();


/* Function to add a new '/me' message to the chat box.
 * Called at each reception of a message of this type through the socket */
var addMeMessage = function(user, cipher, clear, msgdate, mid, insert) {

    /* Escaping html code in new messages to avoid XSS */
    clear = $('<div />').text(clear).html();

    var new_message = "<tr data-author=\"" + user + "\">";
    new_message += "<td colspan=\"3\" class=\"message central-msg me\">";
    new_message += "<span class=\"author\">" + user + "</span>\n";
    new_message += "<span class=\"clear\">" + clear + "</span>";
    new_message += "<span class=\"ciphered hidden\">" + cipher + "</span>";
    new_message += "</td>";
    new_message += "</tr>";

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

    clear = crlfy(clear);
    clear = linkify(clear);
    clear = smilify(clear);

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
        new_message += '<tr class="author"><td>';
        if (user != $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</td><td class="nopoint"></td><td>';
        if (user === $("#user-name").html()) {
            new_message += '<span class="user">' + user + '</span>';
        }
        new_message += '</td></tr>';
    }

    new_message += '<tr>';

    if (user != $("#user-name").html()) {
        new_message +=  '<td class="message" id="' + mid + '"><span class="clear">' + clear + '</span><span class="ciphered hidden">"' + cipher + '</span></td>';
    } else {
        new_message +=  '<td></td>'; 
    }

    /* If the message is from the same user and the date is the same, we do not include a tooltip */
    if (!new_user && last_date === msgdate) {
        new_message += '<td class="nopoint"></td>';
    /* Otherwise, we need to add the date of the message */
    } else {
        new_message += '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="' + tooltip_placement(user) + '" rel="tooltip"> • </a></td>';
    }

    if (user != $("#user-name").html()) {
        new_message += '<td></td>';
    } else {
        new_message += '<td class="message" id="' + mid + '"><span class="clear">' + clear + '</span><span class="ciphered hidden">' + cipher + '</span>';
        new_message = add_glyphicons(new_message);
        new_message += "</td>";
    }

    new_message += '</tr>';
    
    if (insert) {
        /* Append the new message to the chatbox */
        $("#chatbox table tbody").append(new_message)
        
        msg_management_init($(".message:last-child", "tr:last-child", "#chatbox"));

        $('.fsp-tooltip').tooltip('destroy').tooltip();

        /* Notification to the sound alert manager and update window title */
        if (user != $("#user-name").html()) {
            unread += 1;
            update_title();
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

    /* Submission with "Enter" key ; line feed if CTRL */
    $('#new-msg').keydown(function(e){
        if (e.which == 13 && !e.ctrlKey){
            if (!e.crtlKey) {
                e.preventDefault();
                submit_msg();
            }
        }
    });

    $("#edit-msg-box").keydown(function(e){
        if (e.which == 13 && !e.ctrlKey){
            if (!e.crtlKey) {
                e.preventDefault();
                $("#edit-msg").modal('hide');
                mid = $("#msg-to-edit").val();
                edit_message(mid);
            }
        }
    });
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

var reconnect = function() {
    pop_alert("info", "Trying to reconnect ...");

    /* Creation of a socket instance */
    socket = new io.Socket();

    /* Mapping the two handlers */
    socket.on('connect', connected);
    socket.on('message', messaged);
    socket.on('disconnect', closed);

    /* Connect the socket to the server */
    console.log("Connecting socket ...");
    socket.connect();

    pop_alert("info", "Reconnection successful.");
}


/* Handler for new data received through the socket */
var messaged = function(data) {

    if (data == null) return;

    /* If the data is a new message, we add it to the chatbox */
    if (data.type == "new-message") {
        /* Perform a verification on the cid: this avoids problems when the same user is connected simultaneously on
           several comptoirs, it may receive back its own message that targets another comptoir */
        if (data.cid != $("#cid").val()) {
            return;
        }
        /* Testing if this is a '/me' message */
        if (data.me_msg) {
            addMeMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
        } else {
            addMessage(data.user, data.content, Decrypt_Text(data.content, $("#comptoir-key").val()), data.msgdate, data.mid, true);
        }
        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);

    /* Elsif it is an error, we alert the user */
    } else if (data.type == "error") {
        pop_alert("danger", data.error_msg);

    } else if (data.type == "joined" || data.type == "connected") {
        username = data.user;
        for (var i = 0; i < data.cmptrs.length; i++) {
            add_user_online(username, data.cmptrs[i]);
        }
        
        if (data.type == "joined") {
            last_joined = username;
            setTimeout(function() {
                last_joined = "";
            }, 1000);

            if (username != $("#user-name").text()) {
                sound_notification("joined", "");
            }
        }

        /*
        if (username != $("#user-name").text()) {
        }
        */
    } else if (data.type == "users") {
        online = "";
        for (var i = 0; i < data.users_list.length; i++) {
            username = data.users_list[i];
            online += data.users_list[i];
            if (i < data.users_list.length - 1) {
                online += ", ";
            }
        }
        $("#users-connected").text(online);

    } else if (data.type == "left") {
        username = data.user;
        console.log(username + " is leaving.");
        if (username == $("#user-name").text()) {
            reconnect();
            return;
        }
        $("td.td-users", ".scrollable").each(function() {
            online = $(this).text().split(", ");
            if (online.indexOf(username) != -1) {
                online.pop(username);
                $(this).text(online_to_string(online));
            }
        });

        online = online_div.text().split(", ");
        if (online.indexOf(username) != -1) {
            online.pop(username);
            online_div.text(online_to_string(online));
        }

        last_left = username;
        setTimeout(function() {
            last_left = "";
        }, 1000);

        pop_alert("info", "Leaving: " + username);
        sound_notification("left", "");

    } else if (data.type == "ack") {
        enable_sendbox();
    } else if (data.type == "wizz") {
        /* Notification to the sound alert manager */
        sound_notification("wizz", data.cid);
        /* Shaking the chatbox */
        $("#chatbox").velocity("callout.shake", "500ms", "true");
        /* Add message on chatbox */
        $("#chatbox table tbody").append("<tr><td colspan=\"3\" class=\"central-msg wizz\">" + data.from + " sent a wizz.</td></tr>");
        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);

    } else if (data.type == "update-badge") {
        update_badge(data.cid, data.user, data.msgdate);
        if ($(".toggle-sound", "#my-" + data.cid).hasClass("glyphicon-volume-up")) {
            sound_notification("msg");
        }
    } else if (data.type == "edit-msg") {
        mid = data.mid;
        newcipher = data.content;
        newclear = Decrypt_Text(newcipher, localStorage.getItem(key_id));
        replace_message(mid, newcipher, newclear);
    }
}

var closed = function() {
    console.log("Oups.");
    pop_alert("danger", "Connection closed !");
}


/* Creation of a socket instance */
var socket = new io.Socket();

/* Mapping the two handlers */
socket.on('connect', connected);
socket.on('message', messaged);
socket.on('disconnect', closed);


        var a = 0;
var decipher_cmptr_info = function() {
    if ($("#cmptr-info").hasClass("ciphered")) {
        /* Deciphering title */
        ciphered_title = $(".title .ciphered", "#cmptr-info").text();
        key = $("#comptoir-key").val(); 
        if (typeof(key) == "undefined") {
            key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        }
        clear_title = Decrypt_Text(ciphered_title, key);
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

        /*
        $('#chatbox').slimScroll({
            height: 'auto',
            position: 'right',
            size: '2px',
            railSize: '1px',
            distance: '20px',
            color: '#428bca',
            railColor: '#222',
            railOpacity: 0.1,
            wheelStep: 8,
            railVisible: true,
        });
        $("#chatbox").slimScroll({scrollTo: (parseInt($("#chatbox")[0].scrollHeight) - 150).toString() + "px"});
        */

        $(window).focus(function() {
            unread = 0;
            update_title();
        });

        msg_alert = $("#msgAlert")[0];
        wizz_alert = $("#wizzAlert")[0];
        left_alert = $("#leftAlert")[0];
        joined_alert = $("#joinedAlert")[0];
        sound_alert = $("#sound-alert-btn");
        bind_keys();

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

        /* Connect the socket to the server */
        socket.connect();

        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);

        decipher_cmptr_info();
        msg_management_init_all();
}

