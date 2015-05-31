
// TODO
var notif_alert_id = "#notif-alert-btn";

var noties = Array();

var pop_alert = function(alert_type, alert_message) {
    // TODO
    /*
    if ($(notif_alert_id).val() == 0) {
        return;
    }
    */

    var type = 'alert';
    var timeout;

    /*
    if (alert_type == "danger") {
    } else if (alert_type == "warning") {
    } else if (alert_type == "success") {
    } else {
    }
    */

    if (document.hasFocus()) {
        timeout = 7000;
    } else {
        timeout = false;
    }

    var n = noty({
                text: alert_message,
                type: type,
                theme: 'fsp',
                layout: 'topLeft',
                timeout: timeout,
                animation: {
                            open: "animated fadeInLeft",
                            close: "animated fadeOutLeft",
                            speed: 500,
                    }
            });
    if (document.hasFocus()) 
        noties[noties.length] = n;
};

var clear_noties = function() {
    while (noties.length > 0) {
        var n = noties.splice(0, 1);
        n[0].close();
    }
}
