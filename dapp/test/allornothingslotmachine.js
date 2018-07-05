require('truffle-test-utils').init();

const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SimpleGamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const NewVegas = artifacts.require("./NewVegas.sol");
const AllOrNothingSlotmachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");

contract('AllOrNothingSlotmachine', function (accounts) {

    const TOKEN_OWNER = accounts[0];
    const GAMBLING_HALL_OWNER = accounts[1];
    const CASINO_OWNER = accounts[2];
    const SLOTMACHINE_SUPERVISOR = accounts[3];

    const SOME_GUY = accounts[10];
    const SOME_OTHER_GUY = accounts[11];

    let casinoToken;
    let gamblingHall;
    let someOtherGamblingHall;
    let casino;
    let slotmachine;

    const INITIAL_TOKEN_PRICE = new BigNumber(2);
    const INITIAL_EXCHANGE_FEE = new BigNumber(5);
    const PRODUCTION_AMOUNT = new BigNumber(200);

    const SLOTMACHINE_PRIZE = new BigNumber(45);
    const SLOTMACHINE_PRICE = new BigNumber(5);
    const SLOTMACHINE_DEPOSIT = new BigNumber(5);
    const SLOTMACHINE_POSSIBILITIES = new BigNumber(10);
    const SLOTMACHINE_TARGET_BLOCK_OFFSET = new BigNumber(5);

    beforeEach(async() => {
        casinoToken = await CasinoToken.new({from: TOKEN_OWNER});
        gamblingHall = await SimpleGamblingHall.new({from: GAMBLING_HALL_OWNER});
        someOtherGamblingHall = await SimpleGamblingHall.new({from: GAMBLING_HALL_OWNER});
        casino = await NewVegas.new(
            casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(),
            {from: CASINO_OWNER});
        // Using CasinoToken.address does not work here in any case... it throws: NewVegas has no network configuration for its current network id (5777).
        // casino = await NewVegas.new(casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE, INITIAL_EXCHANGE_FEE, {from: CASINO_OWNER});

        slotmachine = await AllOrNothingSlotmachine.new(
            SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
            SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
            {from: SLOTMACHINE_SUPERVISOR});

        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});

        await casino.stockup({from: CASINO_OWNER, value: PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber()});
        await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
        await casino.open({from: CASINO_OWNER});
    });


    //release
    it("SomeGuy releases => should revert", async () => {
        try {
            await slotmachine.release({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.available(), false, "Game should still be unavailable!");
        }
    });
    it("Supervisor releases -> already available => should revert", async () => {
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        try {
            await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.available(), true, "Game should still be available!");
        }
    });
    it("Supervisor releases => should succeed", async () => {
        let result = await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'Released',
                args: {
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.available(), true, "Game should be available!");
    });


    //hold
    it("SomeGuy holds => should revert", async () => {
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        try {
            await slotmachine.hold({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.available(), true, "Game should still be available!");
        }
    });
    it("Supervisor holds -> already unavailable => should revert", async () => {
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
        try {
            await slotmachine.hold({from: SLOTMACHINE_SUPERVISOR});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.available(), false, "Game should still be unavailable!");
        }
    });
    it("Supervisor holds => should succeed", async () => {
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        let result = await slotmachine.hold({from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'Hold',
                args: {
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
    });


    //setGamblingHall
    it("SomeGuy sets gambling hall => should revert", async () => {
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
        try {
            await slotmachine.setGamblingHall(someOtherGamblingHall.address,{from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.gamblingHall(), gamblingHall.address, "Gambling hall should not have changed!");
        }
    });
    it("SomeGuy sets gambling hall -> game is available => should revert", async () => {
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Game should be available!");
        try {
            await slotmachine.setGamblingHall(someOtherGamblingHall.address,{from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.gamblingHall(), gamblingHall.address, "Gambling hall should not have changed!");
        }
    });
    it("Supervisor sets gambling hall => should succeed", async () => {
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
        let result = await slotmachine.setGamblingHall(someOtherGamblingHall.address, {from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'GamblingHallChanged',
                args: {
                    _newGamblingHall: someOtherGamblingHall.address
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.gamblingHall(), someOtherGamblingHall.address, "Gambling hall should have changed!");
    });


    it("SomeGuy sets name => should revert", async () => {
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
        const INITIAL_NAME = await slotmachine.name();
        try {
            await slotmachine.setName("SM1", {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.name(), INITIAL_NAME, "Name should not have changed!");
        }
    });
    it("Supervisor sets name => should revert", async () => {
        assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
        const INITIAL_NAME = await slotmachine.name();
        try {
            await slotmachine.setName("SM1", {from: SLOTMACHINE_SUPERVISOR});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.name(), INITIAL_NAME, "Name should not have changed!");
        }
    });
    it("GamblingHall sets name -> game available => should revert", async () => {
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Game should be available!");
        const INITIAL_NAME = await slotmachine.name();
        try {
            await slotmachine.setName("SM1", {from: SLOTMACHINE_SUPERVISOR});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await slotmachine.name(), INITIAL_NAME, "Name should not have changed!");
        }
    });
    // it("GamblingHall sets name => should succeed", async () => { //not working since we have no priv key for the hall address
    //     assert.equal(await slotmachine.available(), false, "Game should be unavailable!");
    //     const INITIAL_NAME = await slotmachine.name();
    //     const NEW_NAME = "SM1yxyxyxyxyxy";
    //     await slotmachine.setName(NEW_NAME, {from: gamblingHall.address});
    //     assert.equal(await slotmachine.name(), NEW_NAME, "Name should have changed!");
    // });



    // function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success) {
    //     emit Interaction(_origin, _data);
    it("SomeGuy calls tokenFallback => should revert", async () => {
        try {
            await slotmachine.tokenFallback(SOME_GUY, SOME_GUY, 1, "yxyxyxyx", {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });


    // bytes constant public DATA_PULL_THE_LEVER = "pullTheLever";
    it("SomeGuy get DATA_PULL_THE_LEVER => should succeed", async () => {
        await slotmachine.DATA_PULL_THE_LEVER({from: SOME_GUY});
    });


    //pullTheLever event Played(_customer); cannot be captured; //TODO resolution of transfer does not work
    // it("SomeGuy pulls the lever -> not available => should revert", async () => {
    //     await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(50).plus(INITIAL_EXCHANGE_FEE).toNumber()});
    //     try {
    //         await casinoToken.methods['transfer(address,uint256,bytes)'](slotmachine.address, SLOTMACHINE_PRICE.plus(SLOTMACHINE_DEPOSIT).toNumber(), await slotmachine.DATA_PULL_THE_LEVER());
    //         assert.fail(null, null, "Should not be reached!");
    //     } catch(err) {
    //         assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
    //         assert.equal((await casinoToken.balanceOf(slotmachine.address)).toNumber(), 0, "Balance should not have changed!");
    //     }
    // });
    // it("SomeGuy pulls the lever -> casino closed => should revert", async () => {
    //     await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(50).plus(INITIAL_EXCHANGE_FEE).toNumber()});
    //     await casino.close({from: CASINO_OWNER});
    //     try {
    //         await casinoToken.transfer(slotmachine.address, SLOTMACHINE_PRICE.plus(SLOTMACHINE_DEPOSIT).toNumber(), await slotmachine.DATA_PULL_THE_LEVER());
    //         assert.fail(null, null, "Should not be reached!");
    //     } catch(err) {
    //         assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
    //         assert.equal((await casinoToken.balanceOf(slotmachine.address)).toNumber(), 0, "Balance should not have changed!");
    //     }
    // });
    // it("SomeGuy pulls the lever => should succeed", async () => {
    //     await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(50).plus(INITIAL_EXCHANGE_FEE).toNumber()});
    //     await casinoToken.transfer(slotmachine.address, SLOTMACHINE_PRICE.plus(SLOTMACHINE_DEPOSIT).toNumber(), await slotmachine.DATA_PULL_THE_LEVER());
    //     assert.equal((await casinoToken.balanceOf(slotmachine.address)).toNumber(), SLOTMACHINE_PRICE.plus(SLOTMACHINE_DEPOSIT).toNumber(), "Balance should not have changed!");
    //     //skipt blocks
    //     // for(let i = 0; i < await slotmachine.targetBlockOffset(); i++) {
    //     //     await casino.buyTokens({from: SOME_OTHER_GUY, value: INITIAL_TOKEN_PRICE.times(1).plus(INITIAL_EXCHANGE_FEE)})
    //     // }
    // });


    // bytes constant public DATA_CLAIM = "claim";
    it("SomeGuy get DATA_CLAIM => should succeed", async () => {
        await slotmachine.DATA_CLAIM({from: SOME_GUY});
    });

    // function claim(address _customer) internal isAvailable { //TODO resolution of transfer does not work
    //     emit CustomerWon(_customer, prize);
    //     emit CustomerLost(_customer);


    //setPrice
    it("SomeGuy sets price => should revert", async () => {
        let initialPrice = await slotmachine.price();
        let initialPrize = await slotmachine.prize();
        try {
            await slotmachine.setPrice(initialPrice+2, initialPrize+4, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.price()).toNumber(), initialPrice.toNumber(), "Price should not have changed!");
            assert.equal((await slotmachine.prize()).toNumber(), initialPrize.toNumber(), "Prize should not have changed!");
        }
    });
    it("Supervisor sets price -> available => should revert", async () => {
        let initialPrice = await slotmachine.price();
        let initialPrize = await slotmachine.prize();
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Should be available!");
        try {
            await slotmachine.setPrice(initialPrice+2, initialPrize+4, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.price()).toNumber(), initialPrice.toNumber(), "Price should not have changed!");
            assert.equal((await slotmachine.prize()).toNumber(), initialPrize.toNumber(), "Prize should not have changed!");
        }
    });
    it("Supervisor sets price -> casino closed => should revert", async () => {
        let initialPrice = await slotmachine.price();
        let initialPrize = await slotmachine.prize();
        await casino.close({from: CASINO_OWNER});
        assert.equal(await casino.opened(), false, "Should be closed!");
        try {
            await slotmachine.setPrice(initialPrice+2, initialPrize+4, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.price()).toNumber(), initialPrice.toNumber(), "Price should not have changed!");
            assert.equal((await slotmachine.prize()).toNumber(), initialPrize.toNumber(), "Prize should not have changed!");
        }
    });
    it("Supervisor sets price => should succeed", async () => {
        assert.equal(await slotmachine.available(), false, "Should not be available!");
        let result = await slotmachine.setPrice(2, 4, {from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'ParameterChanged',
                args: {
                    _parameter: "price",
                    _newValue: 2
                }
            },
            {
                event: 'ParameterChanged',
                args: {
                    _parameter: "prize",
                    _newValue: 4
                }
            },
        ], 'Event(s) missing!');
        assert.equal((await slotmachine.price()).toNumber(), 2, "Price should have changed!");
        assert.equal((await slotmachine.prize()).toNumber(), 4, "Prize should have changed!");
    });


    //setPossibilities
    it("SomeGuy sets possibilities => should revert", async () => {
        let initialP = await slotmachine.possibilities();
        try {
            await slotmachine.setPossibilities(initialP+2, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.possibilities()).toNumber(), initialP.toNumber(), "Possibilities should not have changed!");
        }
    });
    it("Supervisor sets possibilities -> available => should revert", async () => {
        let initialP = await slotmachine.possibilities();
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Should be available!");
        try {
            await slotmachine.setPossibilities(initialP+2, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.possibilities()).toNumber(), initialP.toNumber(), "Possibilities should not have changed!");
        }
    });
    it("Supervisor sets possibilities => should succeed", async () => {
        assert.equal(await slotmachine.available(), false, "Should not be available!");
        let result = await slotmachine.setPossibilities(12, {from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'ParameterChanged',
                args: {
                    _parameter: "possibilities",
                    _newValue: 12
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.possibilities(), 12, "Possibilities should have changed!");
    });


    //setTargetBlockOffset
    it("SomeGuy sets target block offset => should revert", async () => {
        let initialTbo = await slotmachine.targetBlockOffset();
        try {
            await slotmachine.setTargetBlockOffset(initialTbo+15, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.targetBlockOffset()).toNumber(), initialTbo.toNumber(), "TargetBlockOffset should not have changed!");
        }
    });
    it("Supervisor sets target block offset -> available => should revert", async () => {
        let initialTbo = await slotmachine.targetBlockOffset();
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Should be available!");
        try {
            await slotmachine.setTargetBlockOffset(initialTbo+2, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.targetBlockOffset()).toNumber(), initialTbo.toNumber(), "TargetBlockOffset should not have changed!");
        }
    });
    it("Supervisor sets target block offset => should succeed", async () => {
        assert.equal(await slotmachine.available(), false, "Should not be available!");
        let result = await slotmachine.setTargetBlockOffset(8, {from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'ParameterChanged',
                args: {
                    _parameter: "targetBlockOffset",
                    _newValue: 8
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.targetBlockOffset(), 8, "TargetBlockOffset should have changed!");
    });


    //setDeposit
    it("SomeGuy sets deposit => should revert", async () => {
        let initialDeposit = await slotmachine.deposit();
        try {
            await slotmachine.setDeposit(initialDeposit+15, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.deposit()).toNumber(), initialDeposit.toNumber(), "Deposit should not have changed!");
        }
    });
    it("Supervisor sets deposit -> available => should revert", async () => {
        let initialDeposit = await slotmachine.deposit();
        await slotmachine.release({from: SLOTMACHINE_SUPERVISOR});
        assert.equal(await slotmachine.available(), true, "Should be available!");
        try {
            await slotmachine.setDeposit(initialDeposit+2, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await slotmachine.deposit()).toNumber(), initialDeposit.toNumber(), "Deposit should not have changed!");
        }
    });
    it("Supervisor sets deposit => should succeed", async () => {
        assert.equal(await slotmachine.available(), false, "Should not be available!");
        let result = await slotmachine.setDeposit(654646, {from: SLOTMACHINE_SUPERVISOR});
        assert.web3Events(result, [
            {
                event: 'ParameterChanged',
                args: {
                    _parameter: "deposit",
                    _newValue: 654646
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await slotmachine.deposit(), 654646, "Deposit should have changed!");
    });
});