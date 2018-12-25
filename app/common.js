$(document).ready(function() {
    $.ajaxSetup({ cache: false });
});


var UiAlerts = {
    div: $('#info_alerts'),
    max : 15,
    messages: [],
    messagesCount: 0,
    show: function () {
        var html = '';
        var min_i = UiAlerts.messagesCount - UiAlerts.max;
        if (min_i < 0) min_i = 0;
        for (var i = UiAlerts.messagesCount - 1; i >= min_i; i--) {
            var message = UiAlerts.messages[i];
            html += '<div class="alert alert-' + message.class + '">' + message.text + '</div> ';
            if (message.textarea) {
                html += '<textarea style="width: 100%">' + message.textarea + '</textarea> ';
            }
        }
        ;
        UiAlerts.div.html(html);
    },
    _add: function (css, title, message, textarea) {
        UiAlerts.messages.push({
            class: css, text: '<b>' + title + '</b> ' + message, textarea : textarea
        });
        UiAlerts.messagesCount++;
        UiAlerts.show();
        return false;
    },
    addInfo: function (title, message, textarea) {
        return UiAlerts._add('info', title, message, textarea);
    },
    addError: function (title, message, textarea) {
        return UiAlerts._add('danger', title, message, textarea);
    },
    addSuccess: function (title, message, textarea) {
        return UiAlerts._add('success', title, message, textarea);
    },

    clean : function () {
        UiAlerts.messagesCount = 0;
        UiAlerts.messages = [];
    }
};