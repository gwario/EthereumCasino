pragma solidity ^0.4.22;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/game/AllOrNothingSlotmachine.sol";

// Contract you're testing
contract Thrower {
    function doThrow() public pure {
        revert();
    }

    function doNoThrow() public pure {
        //
    }
}

contract ThrowProxy {
    address public target;
    bytes data;

    constructor(address _target) public {
        target = _target;
    }

    //prime the data using the fallback function.
    function() public {
        data = msg.data;
    }

    function execute() public returns (bool) {
        return target.call(data);
    }

    function constructorTest(bytes32 _name, uint _prize, uint _price, uint _deposit, uint _possibilities, address _gamblingHallAddress, uint8 _targetBlockOffset) public returns (bool) {
        return this.doCreate(_name, _prize, _price, _deposit, _possibilities, _gamblingHallAddress, _targetBlockOffset);
    }

    function doCreate(bytes32 _name, uint _prize, uint _price, uint _deposit, uint _possibilities, address _gamblingHallAddress, uint8 _targetBlockOffset) public returns (bool) {
        new AllOrNothingSlotmachine(_name, _prize, _price, _deposit, _possibilities, _gamblingHallAddress, _targetBlockOffset);
        return true;
    }

    function create(bytes32 _name, uint _prize, uint _price, uint _deposit, uint _possibilities, address _gamblingHallAddress, uint8 _targetBlockOffset) public returns (AllOrNothingSlotmachine) {
        return new AllOrNothingSlotmachine(_name, _prize, _price, _deposit, _possibilities, _gamblingHallAddress, _targetBlockOffset);
    }
}

contract TestAllOrNothingSlotmachine {

    uint constant SLOTMACHINE_PRIZE = 45;
    uint constant SLOTMACHINE_PRICE = 5;
    uint constant SLOTMACHINE_DEPOSIT = 5;
    uint constant SLOTMACHINE_POSSIBILITIES = 10;
    uint8 constant SLOTMACHINE_TARGET_BLOCK_OFFSET = 5;

    function testConstructor_validParameters_shouldSucceed() public {

        ThrowProxy throwProxy = new ThrowProxy(address(0));
        bool success = throwProxy.constructorTest.gas(200000)("Slotmachine1",
            SLOTMACHINE_PRIZE, SLOTMACHINE_PRICE, SLOTMACHINE_DEPOSIT, SLOTMACHINE_POSSIBILITIES,
            DeployedAddresses.SimpleGamblingHall(), SLOTMACHINE_TARGET_BLOCK_OFFSET
        );

        Assert.equal(success, true, "Slotmachine should have been created!");
//        Assert.equal(sm.available(), false, "Slotmachine should be unavailable initially!");
    }

//    function testInitialVotingProhibited() public {
//        ThrowProxy throwProxy = new ThrowProxy(address(123));
//        BeerBar bar = throwProxy.create(address(123), 123);
//
//        Assert.equal(bar.votingIsAllowed(), false, "Voting should not be allowed initially!");
//    }

//    function testConstructorAddressZeroThrows() public {
//
//        ThrowProxy throwProxy = new ThrowProxy(address(0));
//
//        bool success = throwProxy.constructorTest.gas(200000)(address(0), 123);
//
//        Assert.isFalse(success, "Zero address should not be allowed!");
//    }
//
//    function testConstructorPriceZero() public {
//        ThrowProxy throwProxy = new ThrowProxy(address(0));
//
//        bool success = throwProxy.constructorTest.gas(200000)(address(0x123), 0);
//
//        Assert.isFalse(success, "Zero price should not be allowed!");
//    }

    function testThower() public {
        Thrower thrower = new Thrower();
        ThrowProxy throwProxy = new ThrowProxy(address(thrower)); //set Thrower as the contract to forward requests to. The target.

        //prime the proxy.
        Thrower(address(throwProxy)).doThrow();
        //this is the call to a method that does not exist
        //so the default func is triggered, msg.data contains the info to the called method
        //the proxy internally does a call to make the throw become a return.
        //the subsequent call to execute actually does the call to doThrow!

        //execute the call that is supposed to throw.
        //r will be false if it threw. r will be true if it didn't.
        //make sure you send enough gas for your contract method.
        bool r = throwProxy.execute.gas(200000)();

        Assert.isFalse(r, "Should be false, as it should throw");
    }

}
