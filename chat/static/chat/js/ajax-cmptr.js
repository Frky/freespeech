

var getComptoirContent = function(callback, cid) {

    // Creation of an object
    var xhr = getXMLHttpRequest(); 

    // AJAX function on change    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText, cid);
        } else if (xhr.readyState < 4) {
            // The request is in treatment, displaying loader image
            //document.getElementById("loader").style.display = "inline";
        }
    };

    // Initialisation
    xhr.open("GET", "ajax-" + cid, true);
    // Sending request
    xhr.send();
}


var getComptoirInfosCallback = function(data) {
    $(".title", "#cmptr-info").text(data.title);
    $(".desc", "#cmptr-info").text(data.description);

}


var ajax_cmptr_callback = function(data, cid) {
    var old_location = window.location.pathname;
    $("#cid").val(cid);
    $("#content").html(data);
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
    $("#chatbox").slimScroll({scrollTo: $("#chatbox")[0].scrollHeight + "px"});
    */
    if ($("#chatbox").length != 0) {
        key_init();
        msg_management_init_all();
    }

    $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);

    if (old_location == "/") {
        $("#options-container").removeClass("hidden");
        init_cmptr();
    }

    /* Updating connected users */
    online = $("#user-name").text();
    others = $("td.td-users", "#my-" + cid).text().split(", ");
    for (var i = 0; i < others.length; i++) {
        if (others[i] != "") {
            online += ", ";
        }
        online += others[i];
    }
    $("#users-connected").text(online);

    window.history.replaceState({}, cid, cid);
    join_comptoir();

    // decipher_cmptr_info();

    $("#send-form").removeClass("hidden");
    bind_keys();
}


