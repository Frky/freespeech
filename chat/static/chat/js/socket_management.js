
/* Creation of a socket instance */
var socket = new io.Socket();

var disconnected = function() {
    pop_alert("Disconnected ...");
}

socket.on('disconnect', disconnected);
