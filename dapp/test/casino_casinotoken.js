require('truffle-test-utils').init();

const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SimpleGamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const NewVegas = artifacts.require("./NewVegas.sol");
const AllOrNothingSlotmachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");

contract('Casino - CasinoToken', function (accounts) {

    const TOKEN_OWNER = accounts[0];
    const GAMBLING_HALL_OWNER = accounts[1];
    const CASINO_OWNER = accounts[2];
    const SLOTMACHINE_MANAGER = accounts[3];

    const SOME_GUY = accounts[10];

    let casinoToken;
    let gamblingHall;
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
        casino = await NewVegas.new(
            casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(),
            {from: CASINO_OWNER});
        // Using CasinoToken.address does not work here in any case... it throws: NewVegas has no network configuration for its current network id (5777).
        // casino = await NewVegas.new(casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE, INITIAL_EXCHANGE_FEE, {from: CASINO_OWNER});

        slotmachine = await AllOrNothingSlotmachine.new(
            SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
            SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
            {from: SLOTMACHINE_MANAGER});

        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});

        await casino.stockup({from: CASINO_OWNER, value: PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber()});
        await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
    });

    //produce
    it("Some guy produces => should revert", async () => {
        await casino.stockup({from: CASINO_OWNER, value: PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).plus(INITIAL_EXCHANGE_FEE).toNumber()});
        try {
            await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("TokenOwner produces to casino not backed by wei => should revert", async () => {

        try {
            await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("TokenOwner produces to casino backed by wei => should succeed", async () => {
        let initalBalance = web3.eth.getBalance(casino.address).toNumber();
        let initalTokenBalance = (await casinoToken.balanceOf(casino.address)).toNumber();
        let value = PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).plus(INITIAL_EXCHANGE_FEE).toNumber();
        let result = await casino.stockup({from: CASINO_OWNER, value: value});
        assert.web3Event(result, {
            event: 'EtherBalanceChanged',
            args: {
                _newBalance: initalBalance+value,
            }
        }, 'Event(s) missing!');

        result = await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
        assert.web3SomeEvents(result, [
            {
                event: 'ProductionFinished',
                args: {
                    _owner: casino.address,
                    _amount: PRODUCTION_AMOUNT.toNumber()
                }
                // }, { //does not work cause it was emitted in a sub contract-call
                //     event: 'TokenBalanceChanged',
                //     args: {
                //         _newTokenBalance: PRODUCTION_AMOUNT.toNumber(),
                //     }
            }
        ], 'Event(s) missing!');

        assert.equal((await casinoToken.balanceOf(casino.address)).toNumber(), initalTokenBalance+PRODUCTION_AMOUNT.toNumber(), "Casino should own produced tokens.");
    });

    //buy
    it("SomeGuy buys tokens -> casino closed => should revert", async () => {
        try {
            await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).plus(1).toNumber()});
            assert.notEqual((await casinoToken.balanceOf(SOME_GUY)).toNumber(), 5, "Should not get all tokens!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy buys tokens -> not exact value for tokens => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).plus(1).toNumber()});
            assert.notEqual((await casinoToken.balanceOf(SOME_GUY)).toNumber(), 5, "Should not get all tokens!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy buys tokens -> no exchange fee => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(5).toNumber()});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy buys tokens => should succeed", async () => {
        await casino.open({from: CASINO_OWNER});

        let initalBalance = web3.eth.getBalance(casino.address).toNumber();

        let value = INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).toNumber();
        let result = await casino.buyTokens({from: SOME_GUY, value: value});
        assert.web3Events(result, [
            {
                event: 'CustomerBoughtIn',
                args: {
                    _customer: SOME_GUY,
                    _tokens: 5
                }
            },
            {
                event: 'EtherBalanceChanged',
                args: {
                    _newBalance: initalBalance+value,
                }
            },
        ], 'Event(s) missing!');
        assert.equal((await casinoToken.balanceOf(SOME_GUY)).toNumber(), 5, "Should have 5 tokens!");
    });

    //cashout
    it("SomeGuy cashout tokens -> casino closed => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        let value = INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).toNumber();
        await casino.buyTokens({from: SOME_GUY, value: value});
        await casino.close({from: CASINO_OWNER});
        try {
            await casinoToken.cashout(casino.address, 5, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy cashout tokens -> no exchange fee => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        let initialEtherBalance = await web3.eth.getBalance(SOME_GUY).toNumber();
        let value = INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).toNumber();
        await casino.buyTokens({from: SOME_GUY, value: value});
        try {
            await casinoToken.cashout(casino.address, 5, {from: SOME_GUY});
            assert.notEqual(web3.eth.getBalance(SOME_GUY), INITIAL_TOKEN_PRICE.times(5).plus(initialEtherBalance), "Should not get ether for all tokens!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy cashout tokens -> has none => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        try {
            await casinoToken.cashout(casino.address, 5, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy cashout tokens => should succeed", async () => {
        await casino.open({from: CASINO_OWNER});

        let initalBalanceCasino = web3.eth.getBalance(casino.address).toNumber();
        let initalTokenBalanceCasino = (await casinoToken.balanceOf(casino.address)).toNumber();
        let initalBalanceSomeGuy = web3.eth.getBalance(SOME_GUY).toNumber();
        let initalTokenBalanceSomeGuy = (await casinoToken.balanceOf(SOME_GUY)).toNumber();

        let value = INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).toNumber();
        await casino.buyTokens({from: SOME_GUY, value: value});
        let result = await casinoToken.cashout(casino.address, 5, {from: SOME_GUY});

        assert.web3Events(result, [
            {
                event: 'Transfer',
                args: {
                    from: SOME_GUY,
                    to: casino.address,
                    value: 5
                }
            },
            {
                event: 'CustomerPaidOut',
                args: {
                    _owner: SOME_GUY,
                    _value: 5
                }
            },
            // { // not delivered because from another contract
            //     event: 'EtherBalanceChanged',
            //     args: {
            //         _newBalance: initalBalanceCasino+value+INITIAL_EXCHANGE_FEE.toNumber()-5*INITIAL_TOKEN_PRICE.toNumber(),
            //     }
            // },
            // {
            //     event: 'TokenBalanceChanged',
            //     args: {
            //         _newBalance: initalTokenBalanceCasino+value+INITIAL_EXCHANGE_FEE.toNumber()-5*INITIAL_TOKEN_PRICE.toNumber(),
            //     }
            // },
        ], 'Event(s) missing!');

        assert.equal((await casinoToken.balanceOf(SOME_GUY)).toNumber(), 0, "Should have 0 tokens!");
        //buy: casino -> guy
        //cashout: guy -> casino
        assert.equal((await casinoToken.balanceOf(casino.address)).toNumber(), initalTokenBalanceCasino, "Should have initial amount of tokens!");

        //TODO look at ass0.2 and include gas in the calculations in order to make this work
        // assert.equal(await web3.eth.getBalance(SOME_GUY).toNumber(), initalBalanceSomeGuy-INITIAL_EXCHANGE_FEE.times(2).toNumber(), "Should have same as before minus two times exchange fee!");
        // assert.equal(await web3.eth.getBalance(casino.address).toNumber(), initalBalanceCasino+INITIAL_EXCHANGE_FEE.times(2).toNumber(), "Should have same as before plus two times exchange fee!");
    });
});