$(document).ready(function() {
    $('.js-field-checkbox').on('click', function() {
        if ($(this).prop('checked')) {
            $('.js-password-change').attr('type', 'text');
        } else {
            $('.js-password-change').attr('type', 'password');
        }
    });
});