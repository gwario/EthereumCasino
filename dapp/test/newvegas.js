require('truffle-test-utils').init();

const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SimpleGamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const NewVegas = artifacts.require("./NewVegas.sol");
const AllOrNothingSlotmachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");

contract('NewVegas', function (accounts) {

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

    //open
    it("SomeGuy opens => should revert", async () => {
        assert.equal(await casino.opened(), false, "Should be closed!");
        try {
            await casino.open({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(await casino.opened(), false, "Should be closed!");
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner opens => should succeed", async () => {
        assert.equal(await casino.opened(), false, "Should be closed!");
        await casino.open({from: CASINO_OWNER});
        assert.equal(await casino.opened(), true, "Should be opened!");
    });
    it("Is opened -> owner opens => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        assert.equal(await casino.opened(), true, "Should be opened!");
        try {
            await casino.open({from: CASINO_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(await casino.opened(), true, "Should be opened!");
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });

    //close
    it("SomeGuy closes => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        assert.equal(await casino.opened(), true, "Should be opened!");

        try {
            await casino.close({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(await casino.opened(), true, "Should be opened!");
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner closes => should succeed", async () => {
        await casino.open({from: CASINO_OWNER});
        assert.equal(await casino.opened(), true, "Should be opened!");

        await casino.close({from: CASINO_OWNER});
        assert.equal(await casino.opened(), false, "Should be closed!");
    });
    it("Is closed -> owner closes => should revert", async () => {
        assert.equal(await casino.opened(), false, "Should be closed!");
        try {
            await casino.close({from: CASINO_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(await casino.opened(), false, "Should be closed!");
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });

    //buy
    it("SomeGuy buys tokens -> casino closed => should revert", async () => {
        try {
            await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).plus(1).toNumber()});
            assert.notEqual(await casinoToken.balanceOf(SOME_GUY), 5, "Should not get all tokens!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("SomeGuy buys tokens -> not exact value for tokens => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.buyTokens({from: SOME_GUY, value: INITIAL_TOKEN_PRICE.times(5).plus(INITIAL_EXCHANGE_FEE).plus(1).toNumber()});
            assert.notEqual(await casinoToken.balanceOf(SOME_GUY), 5, "Should not get all tokens!");
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
        assert.equal(await casinoToken.balanceOf(SOME_GUY), 5, "Should have 5 tokens!");
    });

    //payout
    it("SomeGuy payout => should revert", async () => {
        try {
            await casino.payout({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner payout -> casino opened => should revert", async () => {
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.payout({from: CASINO_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner payout => should succeed", async () => {

        let initalBalance = web3.eth.getBalance(casino.address).toNumber();
        let result = await casino.payout({from: CASINO_OWNER});
        assert.web3Events(result, [
            {
                event: 'OwnerPaidOut',
                args: {
                    _owner: CASINO_OWNER,
                    _value: initalBalance
                }
            },
            {
                event: 'EtherBalanceChanged',
                args: {
                    _newBalance: 0,
                }
            },
        ], 'Event(s) missing!');
        assert.equal(web3.eth.getBalance(casino.address).toNumber(), 0, "Should have 0 balance now!");
    });

    //stockup
    it("SomeGuy stockup => should revert", async () => {
        try {
            await casino.stockup({from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner stockup => should succeed", async () => {

        let initalBalance = web3.eth.getBalance(casino.address).toNumber();
        let result = await casino.stockup({from: CASINO_OWNER, value: 10});
        assert.web3Events(result, [
            {
                event: 'EtherBalanceChanged',
                args: {
                    _newBalance: initalBalance+10,
                }
            },
        ], 'Event(s) missing!');
        assert.equal(web3.eth.getBalance(casino.address).toNumber(), initalBalance+10, "Should have 0 balance now!");
    });


    //setExchangeFee
    it("SomeGuy set exchange fee => should revert", async () => {
        const EXCHANGE_FEE = 10;
        try {
            await casino.setExchangeFee(EXCHANGE_FEE, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner set exchange fee -> casino opened => should revert", async () => {
        const EXCHANGE_FEE = 10;
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.setExchangeFee(EXCHANGE_FEE, {from: CASINO_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner set exchange fee => should succeed", async () => {
        const EXCHANGE_FEE = 12354;
        let result = await casino.setExchangeFee(EXCHANGE_FEE, {from: CASINO_OWNER});
        assert.web3Events(result, [
            {
                event: 'ExchangeFeeChanged',
                args: {
                    _newExchangeFee: EXCHANGE_FEE,
                }
            },
        ], 'Event(s) missing!');
        assert.equal((await casino.exchangeFee()).toNumber(), EXCHANGE_FEE, "Should have new exchange fee now!");
    });


    //setTokenPrice
    it("SomeGuy set token price => should revert", async () => {
        const TOKEN_PRICE = 10;
        try {
            await casino.setTokenPrice(TOKEN_PRICE, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner set token price -> casino opened => should revert", async () => {
        const TOKEN_PRICE = 10;
        await casino.open({from: CASINO_OWNER});
        try {
            await casino.setTokenPrice(TOKEN_PRICE, {from: CASINO_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
        }
    });
    it("Owner set token price => should succeed", async () => {
        const TOKEN_PRICE = 12354;
        let result = await casino.setTokenPrice(TOKEN_PRICE, {from: CASINO_OWNER});
        assert.web3Events(result, [
            {
                event: 'TokenPriceChanged',
                args: {
                    _newTokenPrice: TOKEN_PRICE,
                }
            },
        ], 'Event(s) missing!');
        assert.equal((await casino.tokenPrice()).toNumber(), TOKEN_PRICE, "Should have new token price now!");
    });



    // function payOutWin(address _customer, uint _prize, bytes32 _gameName) external senderIsGame(_gameName) returns (bool success) {
    //     emit CustomerClaimed(_customer, _prize, _gameName);
    //
    // function setToken(address _tokenAddress) external isClosed onlyRole(ROLE_MANAGER) {
    //     emit TokenChanged(_tokenAddress);
    //     emit TokenBalanceChanged(token.balanceOf(address(this)));
    //
    // function setGamingHall(address _gamblingHallAddress) external isClosed onlyRole(ROLE_MANAGER) {
    //     emit GamblingHallChanged(_gamblingHallAddress);
    //

});