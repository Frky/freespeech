var socket = new io.Socket();

var addMessage = function(user, content, msgdate) {

    var tooltip_placement = function(user) {
        if (user != $("#user-name").html()) return "right";
        else return "left";
    }

    var new_message = ""

    if (user != $("#user-name").html()) {
        new_message +=  '<tr><td>' + unescape(content) + '</td>' + 
                        '<td><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="right" rel="tooltip"> • </a></td>' + 
                        '<td></td></tr>';
    } else {
        new_message +=  '<tr><td></td>' + 
                        '<td class="point"><a href="#" class="fsp-tooltip" data-original-title="' + msgdate + '" data-placement="left" rel="tooltip"> • </a></td>' + 
                        '<td>' + unescape(content) + '</td></tr>';
    }
        
    $("#chatbox table tbody").append(new_message);

    $('.fsp-tooltip').tooltip('destroy').tooltip();
}

var connected = function() {
    socket.subscribe($("#cid").val());
    return;
}

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

var submit_msg = function() {
    data = {cid: $("#cid").val(), content: escape($("#new-msg").val()), session_key: $('#session_key').val()};
    socket.send(data);
    $("#new-msg").val("");
}


$("#send-form").submit(function(event) {
    event.preventDefault();
    submit_msg();
});


$('#new-msg').keypress(function(e){
    if(e.which == 13){
        event.preventDefault();
        submit_msg();
    }
});

var messaged = function(data) {
    if (data.type == "new-message") {
        addMessage(data.user, data.content, data.msgdate);
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
    }
}


socket.connect();
socket.on('connect', connected);
socket.on('message', messaged);

