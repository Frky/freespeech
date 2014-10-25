
/* This script contains the code corresponding to animations in both
   404 and 505 error pages. Two versions of the error page were developped. 
   To switch from one to another, change version (line 6) either to 0 or 1. */

var version = 0;

/* This function emphasis the next sequence of text corresponding 
   to $seq in the html element $el starting from the index $start. */
var highlight_next = function(el, seq, start) {
    /* Index corresponds to the index of the next occurence of $seq in 
       $el starting from $start. */
    var index = el.text().indexOf(seq, start);
    /* If we found an occurence */
    if (index > -1) {
        /* We save the content of $el from 0 to the index of the found element */
        var before = el.text().substr(0, index);
        /* We save the sequence from the found element to the end of the content of $el */
        var after = el.text().substr(index + 3);
        /* We emphasis the found sequence by adding style */
        el.html(before + "<span id=\"senti\" class=\"highlight\">" + seq + "</span>" + after);
        /* Depending on the version of the animation */
        if (version == 1) {
            /* Either we zoom on the found element */
            $("#senti").zoomTo({targetsize:0.1, duration:1000});
            setTimeout(function() {
                $("#senti").zoomTo({targetsize:0.06, duration:1000});
            }, 1000);
        } else if (version == 0) {
            /* Or we just scroll smoothly */
            target = $(".highlight:last");
            $('html,body').animate({
                scrollTop: (target.offset().top - ($( window ).height())/2)
            }, 1000);
        }
        /* We call back recursively highligh_next with the position of 
           the last found element */
        setTimeout(function() {
            highlight_next(el, seq, index + 3);
        }, 1500);
    /* If we didn't find $seq in $el */
    } else {
        /* We restart the research from the beginning */
        setTimeout(function() {
            highlight_next(el, seq, 0);
        }, 1000);
    }
    return;
}

/* Main function to launch the search of an element in 
   the sequence of characters given by $el. Each second, 
   a new iteration is performed. */
var search = function(el, seq) {
    var state = "";
    setTimeout(function() {
        highlight_next(el, seq, 0);
    }, 1000);
}

