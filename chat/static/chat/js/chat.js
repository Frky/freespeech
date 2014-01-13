var socket = new io.Socket();

var addMessage = function(user, content) {

    var new_message = ""

    if (user != $("#user-name").html()) {
        new_message += "<div class=\"message others\">";
        new_message += "<p class=\"msg-info\"><span class=\"user\">" + user + "</span></p>";
    } else {
        new_message += "<div class=\"message me\">";
    }
    
    new_message += "<p class=\"msg-content\">" + unescape(content) + "</p>";
    new_message += "</div>";
    
    $("#chatbox").append(new_message);

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
        addMessage(data.user, data.content);
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
    }
}


socket.connect();
socket.on('connect', connected);
socket.on('message', messaged);

