const App = {
    solc: false, //global compiler object for solidity, preloaded
    account: false, //current metamask account
    network: '', //current metamask network

    init: async function () {
        App._getNetwork();
        App._getSolc();
    },

    compile : function (title, code) {
        UiAlerts.addSuccess(title, 'compiling...');
        console.log('solc', App.solc);

        let result_main = App.solc.compile(code, true);
        if (result_main.errors) {
            $.each(result_main.errors, function (index, error) {
                UiAlerts.addError(title, error);
            });
            return false;
        }
        UiAlerts.addSuccess(title, 'compiled');
        console.log(result_main.contracts[':' + title]);
        return result_main.contracts[':' + title];
    },

    linkTX : function (tx) {
        return '<a href="' + App.network + '/tx/' + tx + '" target="_blank">' + tx + '</a>';
    },

    linkAddr : function (addr) {
        return '<a href="' + App.network + '/address/' + addr + '" target="_blank">' + addr + '</a>';
    },

    _finished : 0,

    _getSolc: async function () {
        let version = await App._getSolcVersion();
        App.solc = await App._getSolcCompiler(version);
        App._setInitFinished();
    },

    _getSolcVersion: async function() {
        return new Promise((resolve, reject) => {
            BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
                resolve(soljsonReleases['0.4.25']);
            });
        });
    },

    _getSolcCompiler: async function (version) {
        return new Promise((resolve, reject) => {
            console.log('Version loading', version);
            BrowserSolc.loadVersion(version, function (compiler) {
                UiAlerts.addSuccess('solc', 'loaded');
                resolve(compiler);
            });
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
