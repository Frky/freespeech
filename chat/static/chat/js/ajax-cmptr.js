
var getComptoirContent = function(callback, cid) {

    // Creation of an object
    var xhr = getXMLHttpRequest(); 

    // AJAX function on change    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            // Callback for results
            callback(xhr.responseText);
        } else if (xhr.readyState < 4) {
            // The request is in treatment, displaying loader image
            //document.getElementById("loader").style.display = "inline";
        }
    };

    // Initialisation
    xhr.open("GET", cid, true);
    // Sending request
    xhr.send();
}


var getComptoirContentCallback = function(data) {
    $("#content").html(data);
    if ($("#chatbox").length != 0) {
        init();
    }
}


$(".cmptr-link").click(function () {
        var cid =  $(this).text();
        $("#cid").val(cid);
        getComptoirContent(getComptoirContentCallback, cid);
});
