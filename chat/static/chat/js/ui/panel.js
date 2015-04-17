
var init_ui_panel = function() {
    $(".toggle-sound").click(function() {
        $(this).toggleClass("glyphicon-volume-up");
        $(this).toggleClass("glyphicon-volume-off");
    });

    $(".toggle-hist").click(function() {
        $(this).toggleClass("glyphicon-floppy-saved");
        $(this).toggleClass("glyphicon-floppy-remove");
    });
}
