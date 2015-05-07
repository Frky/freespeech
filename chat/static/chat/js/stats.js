
var nb_wizz_div;
var nb_auth_div;

var authors = [];
var nb_wizz = 0;

var stats_init = function() {
    nb_wizz_div = $("#nb-wizz");
    nb_auth_div = $("#nb-auth");
    nb_msg_div = $("#nb-msg");
}

var incr_wizz = function() {
    nb_wizz += 1;
    $(nb_wizz_div).text(nb_wizz);
}

incr_msg = function() {
    var nb_msg = parseInt($(nb_msg_div).text()); 
    $(nb_msg_div).text(nb_msg + 1);
}

var add_auth = function(auth) {
    if (auth == "") return;
    for (i = 0; i < authors.length; i++)
        if (authors[i] == auth)
            return;
    console.log(auth);
    authors[authors.length] = auth;
    $(nb_auth_div).text(authors.length);
}

var reset_stats = function() {
    authors = [];
    nb_wizz = 0;
}

var set_stats = function() {
    console.log(nb_wizz);
    console.log(authors);
    $(nb_wizz_div).text(nb_wizz);
    $(nb_auth_div).text(authors.length);
}
