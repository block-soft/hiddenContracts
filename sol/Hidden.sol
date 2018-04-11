pragma solidity ^0.4.21;
contract HiddenContract {
    address constant ESCROW = 0x9e671657FeA2427d5931E59B9A3b92EB68ac5182;
    function HiddenContract() public {

    }
    function () payable public {

    }

    function getBalance() public constant returns(uint) {
        return address(this).balance;
    }

    function payBalance() payable public returns (bool) {
        ESCROW.transfer(msg.value);
        return true;
    }
}