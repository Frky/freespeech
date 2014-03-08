
var pop_alert = function(alert_type, alert_message) {
        if (alert_type == "danger") {
            alert_name = "Error!";
        } else if (alert_type == "warning") {
            alert_name = "Warning!";
        } else if (alert_type == "success") {
            alert_name = "Success!";
        } else {
            alert_name = "Info!";
        }

        alert_element = "<div class=\"alert alert-" + alert_type + " alert-dismissable\">";
        alert_element += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>";
        alert_element += "<strong>" + alert_name + "</strong> " + alert_message + "</div>";
        $("#alertBox").append(alert_element);
};
