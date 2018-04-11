var ContractsData = {
    mainCode: false,
    mainData: false,
    mainAddress : false,

    current_step: 0,
    current_tx : false,


    hiddenCode: false,
    hiddenData: false,
    hiddenAddress : false,

    savedHiddenCode : false,
    savedHiddenCodeTx : false,

    escrowTx : false
}

var Contracts = {
    mainContract : false,

    _breakStrpos: 60,

    _save: function () {
        localStorage.setItem('ContractsData', JSON.stringify(ContractsData));
    },

    _restore: function () {
        var tmp = JSON.parse(localStorage.getItem('ContractsData'));
        if (!tmp) return false;
        ContractsData = tmp;

        if (ContractsData.mainAddress) {
            UiAlerts.addSuccess('MainContract', 'address: ' + App.linkAddr(ContractsData.mainAddress));
            $('#contract_button_1').hide();
            $('#contract_button_2').show();
        }

        if (ContractsData.savedHiddenCode) {
            UiAlerts.addSuccess('HiddenContract.bytecode PLZ STORE', '', ContractsData.hiddenData.bytecode);
        }

        if (ContractsData.savedHiddenCodeTx) {
            UiAlerts.addSuccess('MainContract.setCode', 'tx: ' + App.linkTX(ContractsData.savedHiddenCodeTx));
            $('#contract_button_2').hide();
            $('#contract_button_3').show();
        }

        if (ContractsData.hiddenAddress) {
            UiAlerts.addSuccess('HiddenContract', 'address: ' + App.linkAddr(ContractsData.hiddenAddress));
            $('#contract_button_3').hide();
            $('#contract_button_4').show();
        }

        if (ContractsData.escrowTx) {
            UiAlerts.addSuccess('HiddenContract', 'tx: ' + App.linkTX(ContractsData.escrowTx));
            $('#contract_button_4').hide();
            $('#contract_button_5').show();
        }

        if (ContractsData.current_tx) {
            if (ContractsData.current_step == 1) {
                Contracts.deployMain();
            } else if (ContractsData.current_step == 2) {
                Contracts.pushHidden();
            } else if (ContractsData.current_step == 3) {
                Contracts.deployHidden();
            } else if (ContractsData.current_step == 4) {
                Contracts.escrowMain();
            }
        }

    },

    //step 1
    deployMain: function (code) {
        if (code || !ContractsData.mainData) {
            if (ContractsData.mainCode != code || !ContractsData.mainData) {
                ContractsData.mainCode = code;
                ContractsData.mainData = App.compile('MainContract', code);
                Contracts._save();
            }
            if (!ContractsData.mainData) return false;
        }

        TXWrapper.title = 'MainContract';
        TXWrapper.action_title = '';
        TXWrapper.action_title_ing = 'deploying';
        TXWrapper.function_callback = Contracts.deployMainFinished;

        if (!ContractsData.current_tx) {
            ContractsData.current_step = 1;
            TXWrapper.init({
                value: 0,
                data: ContractsData.mainData.bytecode
            });
        } else {
            TXWrapper.cron_tx = ContractsData.current_tx;
            TXWrapper.cronning();
        }
    },

    deployMainFinished : function (data) {
        ContractsData.mainAddress = data.contractAddress;
        Contracts._save();
        UiAlerts.addSuccess('MainContract', 'address: ' + App.linkAddr(ContractsData.mainAddress));
        $('#contract_button_1').hide();
        $('#contract_button_2').show();
    },

    //step 2
    pushHidden: function (code) {
        if (code || !ContractsData.hiddenData) {
            if (ContractsData.hiddenCode != code || !ContractsData.hiddenData) {
                ContractsData.hiddenCode = code;
                ContractsData.hiddenData = App.compile('HiddenContract', code);
                Contracts._save();
            }
            if (!ContractsData.hiddenData) return false;
        }

        TXWrapper.title = 'MainContract';
        TXWrapper.action_title = 'setCode';
        TXWrapper.action_title_ing = 'sending code';
        TXWrapper.function_callback = Contracts.pushHiddenFinished;

        if (!ContractsData.current_tx) {

            if (!Contracts.mainContract) {
                var tmp = web3.eth.contract(JSON.parse(ContractsData.mainData.interface));
                Contracts.mainContract = tmp.at(ContractsData.mainAddress);
            }

            var prep_bytecode = '0x' + ContractsData.hiddenData.bytecode.substr(0, 10) + ContractsData.hiddenData.bytecode.substr(Contracts._breakStrpos + 10);

            Contracts.mainContract.countCode(prep_bytecode, function (e, data) {
                if (e) {
                    UiAlerts.addError('MainContract.countCode Gas', e.toString());
                    return false;
                }
                ContractsData.savedHiddenCode = data;
                UiAlerts.addSuccess('HiddenContract.bytecode PLZ STORE', '', ContractsData.hiddenData.bytecode);
                ContractsData.current_step = 2;
                TXWrapper.contract(Contracts.mainContract.setCode, ContractsData.savedHiddenCode);
            });
        } else {
            TXWrapper.cron_tx = ContractsData.current_tx;
            TXWrapper.cronning();
        }
    },

    pushHiddenFinished : function (data) {
        console.log(data);
        ContractsData.savedHiddenCodeTx = data.transactionHash;
        Contracts._save();
        UiAlerts.addSuccess('MainContract.setCode', 'tx: ' + App.linkTX(ContractsData.savedHiddenCodeTx));
        $('#contract_button_2').hide();
        $('#contract_button_3').show();
    },

    //step 3
    deployHidden: function (code) {
        TXWrapper.title = 'HiddenContract';
        TXWrapper.action_title = '';
        TXWrapper.action_title_ing = 'deploying';
        TXWrapper.function_callback = Contracts.deployHiddenFinished;

        if (!ContractsData.current_tx) {
            ContractsData.current_step = 3;
            TXWrapper.init({
                value: 0,
                data: ContractsData.hiddenData.bytecode
            });
        } else {
            TXWrapper.cron_tx = ContractsData.current_tx;
            TXWrapper.cronning();
        }
    },

    deployHiddenFinished : function (data) {
        ContractsData.hiddenAddress = data.contractAddress;
        Contracts._save();
        UiAlerts.addSuccess('HiddenContract', 'address: ' + App.linkAddr(ContractsData.hiddenAddress));
        $('#contract_button_3').hide();
        $('#contract_button_4').show();
    },

    //step 4
    escrowMain: function () {
        TXWrapper.title = 'MainContract';
        TXWrapper.action_title = 'escrow';
        TXWrapper.action_title_ing = 'escrowing money';
        TXWrapper.function_callback = Contracts.escrowMainFinished;

        if (!ContractsData.current_tx) {

            if (!Contracts.mainContract) {
                var tmp = web3.eth.contract(JSON.parse(ContractsData.mainData.interface));
                Contracts.mainContract = tmp.at(ContractsData.mainAddress);
            }
            ContractsData.current_step = 4;
            TXWrapper.contract(Contracts.mainContract.escrow, ContractsData.hiddenAddress);
        } else {
            TXWrapper.cron_tx = ContractsData.current_tx;
            TXWrapper.cronning();
        }
    },

    escrowMainFinished : function (data) {
        console.log(data);
        ContractsData.escrowTx = data.transactionHash;
        //Contracts._save();
        UiAlerts.addSuccess('MainContract.escrow', 'tx: ' + App.linkTX(ContractsData.escrowTx));
        $('#contract_button_4').hide();
        $('#contract_button_5').show();
    },

    //step 5

    restart : function () {
        ContractsData = {
            mainCode: false,
            mainData: false,
            mainAddress : false,

            current_step: 0,
            current_tx : false,


            hiddenCode: false,
            hiddenData: false,
            hiddenAddress : false,

            savedHiddenCode : false,
            savedHiddenCodeTx : false,

            escrowTx : false
        };

        localStorage.setItem('ContractsData', JSON.stringify(ContractsData));
        $('#contract_button_5').hide();
        $('#contract_button_1').show();
        UiAlerts.clean();
    }

}