
var version = 1;

var highlight_next = function(el, seq, start) {
    var index = el.text().indexOf("404", start);
    if (index > -1) {
        var before = el.text().substr(0, index);
        var after = el.text().substr(index + 3);
        el.html(before + "<span id=\"senti\" class=\"highlight\">404</span>" + after);
        if (version == 1) {
            $("#senti").zoomTo({targetsize:0.1, duration:1000});
            setTimeout(function() {
                $("#senti").zoomTo({targetsize:0.06, duration:1000});
            }, 1000);
        } else if (version == 0) {
            target = $(".highlight:last");
            $('html,body').animate({
                scrollTop: (target.offset().top - ($( window ).height())/2)
            }, 1000);
        }
        setTimeout(function() {
            highlight_next(el, seq, index + 3);
        }, 1500);
    } else {
        setTimeout(function() {
            highlight_next(el, seq, 0);
        }, 1000);
    }
    return;
}

var search = function(el, seq) {
    var state = "";
    setTimeout(function() {
        highlight_next(el, seq, 0);
    }, 1000);
}

