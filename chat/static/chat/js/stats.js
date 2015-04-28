
var nb_wizz_div;
var nb_auth_div;

var authors = [];

var stats_init = function() {
    nb_wizz_div = $("#nb-wizz");
    nb_auth_div = $("#nb-auth");
}

var incr_wizz = function() {
    var nb_wizz = parseInt($(nb_wizz_div).text()); 
    $(nb_wizz_div).text(nb_wizz + 1);
}

var add_auth = function(auth) {
    if (auth == "") return;
    for (i = 0; i < authors.length; i++)
        if (authors[i] == auth)
            return;
    authors[authors.length] = auth;
    var nb_auth = parseInt($(nb_auth_div).text()); 
    $(nb_auth_div).text(nb_auth + 1);
}
