require('truffle-test-utils').init();

const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SimpleGamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const NewVegas = artifacts.require("./NewVegas.sol");

contract('CasinoToken', function (accounts) {

    const TOKEN_OWNER = accounts[0];
    const GAMBLING_HALL_OWNER = accounts[1];
    const CASINO_OWNER = accounts[2];

    const NOT_TOKEN_OWNER = accounts[9];//increase ganache accounts to 15

    let casinoToken;
    let gamblingHall;
    let casino;

    const INITIAL_TOKEN_PRICE = new BigNumber(2345678910111213); //about 1€
    const INITIAL_EXCHANGE_FEE = new BigNumber(0);
    const PRODUCTION_AMOUNT = new BigNumber(200);


    beforeEach(async() => {
        casinoToken = await CasinoToken.new({from: TOKEN_OWNER});
        gamblingHall = await SimpleGamblingHall.new({from: GAMBLING_HALL_OWNER});
        casino = await NewVegas.new(casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(), {from: CASINO_OWNER});
        // Using CasinoToken.address does not work here in any case... it throws: NewVegas has no network configuration for its current network id (5777).
        // casino = await NewVegas.new(casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE, INITIAL_EXCHANGE_FEE, {from: CASINO_OWNER});

        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
    });

    it("NotTokenOwner produces => should revert", async () => {
        try {
            await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: NOT_TOKEN_OWNER});
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

        let result = await casino.send(PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber(), {from: TOKEN_OWNER});
        assert.web3Event(result, {
            event: 'EtherBalanceChanged',
            args: {
                _newBalance: PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber(),
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

        assert.equal(await casinoToken.balanceOf(casino.address), PRODUCTION_AMOUNT.toNumber(), "Casino should own produced tokens.");
    });
});