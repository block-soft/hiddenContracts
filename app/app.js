var App = {
    version: 'soljson-v0.4.21+commit.dfe3193c.js', //solc compiler version
    solc: false, //global compiler object for solidity, preloaded
    account: false, //current metamask account
    network: '', //current metamask network

    init: function () {
        App._getCompiler();
        App._getNetwork();
    },

    compile : function (title, code) {
        UiAlerts.addSuccess(title, 'compiling...');
        var result_main = App.solc.compile(code, true);
        if (result_main.errors) {
            $.each(result_main.errors, function (index, error) {
                UiAlerts.addError(title, error);
            });
            return false;
        }
        UiAlerts.addSuccess(title, 'compiled');
        return result_main.contracts[':' + title];
    },

    linkTX : function (tx) {
        return '<a href="' + App.network + '/tx/' + tx + '" target="_blank">' + tx + '</a>';
    },

    linkAddr : function (addr) {
        return '<a href="' + App.network + '/address/' + addr + '" target="_blank">' + addr + '</a>';
    },

    _finished : 0,

    _getCompiler: function () {
        BrowserSolc.loadVersion(App.version, function (compiler) {
            UiAlerts.addSuccess('solc', 'loaded');
            App.solc = compiler;
            App._setInitFinished();
        });
    },

    _getNetwork: function () {
        web3.version.getNetwork(function (error, data) {
            switch (data) {
                case "1":
                    App.network = 'https://etherscan.io';
                    break
                case "3":
                    App.network = 'https://ropsten.etherscan.io';
                    break;
                case "4":
                    App.network = 'https://rinkeby.etherscan.io';
                    break;
                case "41":
                    App.network = 'https://kovan.etherscan.io';
                    break;
                default:
                    console.log('This is an unknown network.')
            }

            web3.eth.getAccounts(function (error, data) {
                if (error) {
                    $('#info_accounts').html('<h2>No accounts</h2> ' + error.toString());
                } else if (!data || data.length == 0) {
                    $('#info_accounts').html('<h2>No accounts</h2> plz unlock metamask accounts and reload page');
                } else {
                    App.account = data[0];
                    $('#info_accounts_owner').html('<a class="btn btn-info" href="' + App.network + '/address/' + App.account + '" target="_blank">' + App.account + '</a>');
                    App._setInitFinished();
                }
            });
        });
    },

    _setInitFinished: function () {
        App._finished++;
        if ( App._finished >= 2) {
            $('#loading_boxes').hide();
            $('#loaded_boxes').show();
            $('#contract_button_0').hide();
            $('#contract_button_1').show();
            Contracts._restore();
        }
    }
}
