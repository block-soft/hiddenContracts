var TXWrapper = {
    title: '',
    action_title: '',
    action_title_ing: '',
    function_callback: false,

    cron_tx: '',

    _unique: 0,
    _cron_step: 0,

    init: function (data) {
        UiAlerts.addSuccess(TXWrapper.title, TXWrapper.action_title_ing + '...');
        var params = data;
        params.from = App.account;
        web3.eth.estimateGas(params, function (e, gas) {
            if (e) {
                UiAlerts.addError(TXWrapper.title + ' ' + TXWrapper.action_title + ' Gas', e.toString().substr(0, 200));
                return false;
            }
            params.gas = gas;
            web3.eth.sendTransaction(params, function (e, tx) {
                if (e) {
                    UiAlerts.addError(TXWrapper.title + ' ' + TXWrapper.action_title, e.toString().substr(0, 200));
                    return false;
                }
                TXWrapper.cron_tx = tx;
                ContractsData.current_tx = tx;
                Contracts._save();
                TXWrapper.cronning();
            });
        });
    },

    contract: function (func, value) {
        UiAlerts.addSuccess(TXWrapper.title, TXWrapper.action_title_ing + '...');
        func.estimateGas(value, {from: App.account}, function (e, gas) {
            if (e) {
                UiAlerts.addError(TXWrapper.title + ' ' + TXWrapper.action_title + ' Gas', e.toString().substr(0, 200));
                return false;
            }
            func(value, {from: App.account, gas: gas}, function (e, tx) {
                if (e) {
                    UiAlerts.addError(TXWrapper.title + ' ' + TXWrapper.action_title, e.toString().substr(0, 200));
                    return false;
                }
                TXWrapper.cron_tx = tx;
                ContractsData.current_tx = tx;
                Contracts._save();
                TXWrapper.cronning();
            });
        });
    },

    cronning: function () {
        TXWrapper._unique++;
        setTimeout(TXWrapper._cronRun, 100);
        UiAlerts.addInfo(TXWrapper.title + ' ' + TXWrapper.action_title, ' tx: ' + App.linkTX(TXWrapper.cron_tx));
    },

    _cronRun: function () {
        if (!TXWrapper.cron_tx) return false;
        web3.eth.getTransactionReceipt(TXWrapper.cron_tx, function (e, data) {
            if (e) {
                UiAlerts.addError(TXWrapper.title + ' ' + TXWrapper.action_title, e.toString().substr(0, 200));
                return false;
            }

            if (!data) {
                if (!TXWrapper._cron_step) {
                    UiAlerts.addInfo(TXWrapper.title + ' ' + TXWrapper.action_title, '<span id="tx_mining_' + TXWrapper._unique + '">mining...</span>');
                } else {
                    $('#tx_mining_' + TXWrapper._unique).append('.');
                }
                TXWrapper._cron_step++;
                setTimeout(TXWrapper._cronRun, TXWrapper._cron_step > 10 ? 500 : 1000);
                return false;
            }

            TXWrapper.cron_tx = false;
            ContractsData.current_tx = false;
            TXWrapper.function_callback(data);
        });
    }
}
