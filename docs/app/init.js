try {
    $.get('./sol/Hidden.sol', function (data, status) {
        $("#contract_hidden_code").val(data);
    });
    $.get('./sol/Main.sol', function (data, status) {
        $("#contract_main_code").val(data);
    });
    window.addEventListener('load', function () {
        if (typeof web3 !== 'undefined') {
            UiAlerts.addSuccess('web3', 'loaded');
            web3 = new Web3(web3.currentProvider);
            App.init();
        } else {
            UiAlerts.addError('web3', 'metamask is required');
        }
    });
} catch (e) {
    UiAlerts.addError('web3', e.toString())
}