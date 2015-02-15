
var smilify = function(txt) {

    txt = txt.replace(":)", "<img class=\"smiley\" src=\"static/chat/images/smileys/smile.png\" alt=\":)\" />");
    txt = txt.replace(":d", "<img class=\"smiley\" src=\"static/chat/images/smileys/bigsmile.png\" alt=\":d\" />");
    txt = txt.replace(":D", "<img class=\"smiley\" src=\"static/chat/images/smileys/bigbigsmile.png\" alt=\":D\" />");
    txt = txt.replace(":p", "<img class=\"smiley\" src=\"static/chat/images/smileys/tongue.png\" alt=\":p\" />");
    txt = txt.replace(";)", "<img class=\"smiley\" src=\"static/chat/images/smileys/wink.png\" alt=\";)\" />");
    txt = txt.replace("8)", "<img class=\"smiley\" src=\"static/chat/images/smileys/sunglasses.png\" alt=\"8)\" />");
    txt = txt.replace(":o", "<img class=\"smiley\" src=\"static/chat/images/smileys/estonished.png\" alt=\":o\" />");
    txt = txt.replace(":s", "<img class=\"smiley\" src=\"static/chat/images/smileys/confused.png\" alt=\":s\" />");
    txt = txt.replace(":(", "<img class=\"smiley\" src=\"static/chat/images/smileys/sad.png\" alt=\":(\" />");
    txt = txt.replace("oO", "<img class=\"smiley\" src=\"static/chat/images/smileys/bigeyes.png\" alt=\"oO\" />");

    return txt;

}

function linkify(text) {  
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return text.replace(urlRegex, function(url) {  
        return '<a href="' + url + '">' + url + '</a>';  
    })  
}

/* Function to replace the \n to break lines in html */
var crlfy = function(text) {
    return text.replace("\n", "<br />");
}

var msgify = function(txt) {
    return smilify(linkify(crlfy(txt)));
}
