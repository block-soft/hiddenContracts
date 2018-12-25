pragma solidity >=0.4.0 <0.6.0;

contract HiddenContract {
    address payable constant ESCROW = 0x9e671657FeA2427d5931E59B9A3b92EB68ac5182;

    function () external payable {

    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function payBalance() payable public returns (bool) {
        ESCROW.transfer(msg.value);
        return true;
    }
}