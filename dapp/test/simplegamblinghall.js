require('truffle-test-utils').init();

const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SimpleGamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const NewVegas = artifacts.require("./NewVegas.sol");
const AllOrNothingSlotmachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");

contract('SimpleGamblingHall', function (accounts) {

    const TOKEN_OWNER = accounts[0];
    const GAMBLING_HALL_OWNER = accounts[1];
    const CASINO_OWNER = accounts[2];
    const SLOTMACHINE_MANAGER = accounts[3];

    const SOME_GUY = accounts[10];
    const SOME_OTHER_GUY = accounts[11];

    let casinoToken;
    let gamblingHall;
    let casino;
    let someOtherCasino;
    let slotmachine;
    let otherSlotmachine;

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
        someOtherCasino = await NewVegas.new(
            casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(),
            {from: CASINO_OWNER});

        slotmachine = await AllOrNothingSlotmachine.new(
            SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
            SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
            {from: SLOTMACHINE_MANAGER});

        otherSlotmachine = await AllOrNothingSlotmachine.new(
            SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
            SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
            {from: SLOTMACHINE_MANAGER});

        await casino.stockup({from: CASINO_OWNER, value: PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber()});
        await casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
    });


    //addGame
    it("SomeGuy adds game => should revert", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        try {
            await gamblingHall.addGame("SM1", slotmachine.address, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 0, "Game should not have been added!");
        }
    });
    it("Manager adds game -> has no casino => should revert", async () => {
        try {
            await gamblingHall.addGame("SM1", slotmachine.address, {from: GAMBLING_HALL_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 0, "Game should not have been added!");
        }
    });
    it("Manager adds game -> game name already exists => should revert", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame("SM1", slotmachine.address, {from: GAMBLING_HALL_OWNER});
        try {
            await gamblingHall.addGame("SM1", otherSlotmachine.address, {from: GAMBLING_HALL_OWNER});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 1, "Game should not have been added!");
        }
    });
    // it("Manager adds game -> game address already exists => should revert", async () => { //too expensive to implement
    //     await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
    //     await gamblingHall.addGame("SM1", slotmachine.address, {from: GAMBLING_HALL_OWNER});
    //     try {
    //         await gamblingHall.addGame("SM2", slotmachine.address, {from: GAMBLING_HALL_OWNER});
    //         assert.fail(null, null, "Should not be reached!");
    //     } catch(err) {
    //         assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
    //         assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 1, "Game should not have been added!");
    //     }
    // });
    it("Manager adds game => should succeed", async () => {
        const SM_NAME = "SM1";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        let result = await gamblingHall.addGame(SM_NAME, slotmachine.address, {from: GAMBLING_HALL_OWNER});
        assert.web3Events(result, [
            {
                event: 'GameAdded',
                args: {
                    _newGame: slotmachine.address,
                    _gameName: web3.fromAscii(SM_NAME).padEnd(66, "0"),
                    _gameType: await slotmachine.gameType()
                }
            },
        ], 'Event(s) missing!');

        assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 1, "Game should have been added!");
        assert.equal(await gamblingHall.getGameAddress(SM_NAME, {from: SOME_GUY}), slotmachine.address, "Game should have the correct address!");
        assert.equal(await gamblingHall.getGameType(SM_NAME, {from: SOME_GUY}), await slotmachine.gameType(), "Game should have the correct type!");
    });
    it("Manager 2 adds game => should succeed", async () => {
        const SM_NAME_1 = "SM1";
        const SM_NAME_2 = "SM2";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        let result = await gamblingHall.addGame(SM_NAME_1, slotmachine.address, {from: GAMBLING_HALL_OWNER});
        assert.web3Events(result, [
            {
                event: 'GameAdded',
                args: {
                    _newGame: slotmachine.address,
                    _gameName: web3.fromAscii(SM_NAME_1).padEnd(66, "0"),
                    _gameType: await slotmachine.gameType()
                }
            },
        ], 'Event(s) missing!');

        result = await gamblingHall.addGame(SM_NAME_2, otherSlotmachine.address, {from: GAMBLING_HALL_OWNER});
        assert.web3Events(result, [
            {
                event: 'GameAdded',
                args: {
                    _newGame: otherSlotmachine.address,
                    _gameName: web3.fromAscii(SM_NAME_2).padEnd(66, "0"),
                    _gameType: await otherSlotmachine.gameType()
                }
            },
        ], 'Event(s) missing!');

        assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 2, "Games should have been added!");
        assert.equal(await gamblingHall.getGameAddress(SM_NAME_1, {from: SOME_GUY}), slotmachine.address, "Game should have the correct address!");
        assert.equal(await gamblingHall.getGameType(SM_NAME_1, {from: SOME_GUY}), await slotmachine.gameType(), "Game should have the correct type!");
        assert.equal(await gamblingHall.getGameAddress(SM_NAME_2, {from: SOME_GUY}), otherSlotmachine.address, "Game should have the correct address!");
        assert.equal(await gamblingHall.getGameType(SM_NAME_2, {from: SOME_GUY}), await otherSlotmachine.gameType(), "Game should have the correct type!");
    });


    //removeGame
    it("SomeGuy removes game => should revert", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame("SM1", slotmachine.address, {from: GAMBLING_HALL_OWNER});
        try {
            await gamblingHall.removeGame("SM1", {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 1, "Game should not have been added!");
        }
    });
    it("Manager removes game => should succeed", async () => {
        const SM_NAME_1 = "SM1";
        const SM_NAME_2 = "SM2";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_1, slotmachine.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_2, otherSlotmachine.address, {from: GAMBLING_HALL_OWNER});

        let result = await gamblingHall.removeGame(SM_NAME_1, {from: GAMBLING_HALL_OWNER});
            assert.web3Events(result, [
            {
                event: 'GameRemoved',
                args: {
                    _game: slotmachine.address,
                }
            },
        ], 'Event(s) missing!');

        assert.equal((await gamblingHall.getGameNames({from: SOME_GUY})).length, 1, "1 game should have been removed!");
        assert.equal(await gamblingHall.getGameAddress(SM_NAME_2, {from: SOME_GUY}), otherSlotmachine.address, "Game should have the correct address!");
        assert.equal(await gamblingHall.getGameType(SM_NAME_2, {from: SOME_GUY}), await otherSlotmachine.gameType(), "Game should have the correct type!");
    });


    //getGameNames
    it("Manager get game names => should return all games", async () => {
        const SM_NAME_1 = "SM1";
        const SM_NAME_2 = "SM2";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_1, slotmachine.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_2, otherSlotmachine.address, {from: GAMBLING_HALL_OWNER});

        let gameNames  = await gamblingHall.getGameNames({from: SOME_GUY});
        assert.equal(gameNames.length, 2, "Should return 2 games!");
        assert.equal(gameNames.some(value => web3.toAscii(value).startsWith(SM_NAME_1)), true, "Should contain first game!");
        assert.equal(gameNames.some(value => web3.toAscii(value).startsWith(SM_NAME_2)), true, "Should contain second game!");

    });

    //getGameAddress
    it("Game does not exist => should return address(0)", async () => {
        const SM_NAME_1 = "SM1";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});

        assert.equal(await gamblingHall.getGameAddress(SM_NAME_1, {from: SOME_GUY}), "0x0000000000000000000000000000000000000000", "Game should have the correct address!");
    });
    it("Game exists => should return address", async () => {
        const SM_NAME_1 = "SM1";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_1, slotmachine.address, {from: GAMBLING_HALL_OWNER});

        assert.equal(await gamblingHall.getGameAddress(SM_NAME_1, {from: SOME_GUY}), slotmachine.address, "Game should have the correct address!");
    });


    //getGameType
    it("Game does not exist => should return type 0", async () => {
        const SM_NAME_1 = "SM1";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});

        assert.equal(await gamblingHall.getGameType(SM_NAME_1, {from: SOME_GUY}), "0x0000000000000000", "Game should have the correct type!");
    });
    it("Game exists => should return type", async () => {
        const SM_NAME_1 = "SM1";
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.addGame(SM_NAME_1, slotmachine.address, {from: GAMBLING_HALL_OWNER});

        assert.equal(await gamblingHall.getGameType(SM_NAME_1, {from: SOME_GUY}), await slotmachine.gameType(), "Game should have the correct type!");
    });


    //setManager
    it("SomeGuy sets manager => should revert", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        try {
            await gamblingHall.setManager(SOME_OTHER_GUY, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await gamblingHall.manager(), '0x0000000000000000000000000000000000000000', "Owner should still be manager!");
        }
    });
    it("Owner sets manager => should succeed", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        await gamblingHall.setManager(SOME_OTHER_GUY, {from: GAMBLING_HALL_OWNER});
        assert.equal(await gamblingHall.manager(), SOME_OTHER_GUY, "SomeOtherGuy should be manager!");
    });


    //setCasino
    it("SomeGuy sets casino => should revert", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        try {
            await gamblingHall.setCasino(someOtherCasino.address, {from: SOME_GUY});
            assert.fail(null, null, "Should not be reached!");
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
            assert.equal(await gamblingHall.casino(), casino.address, "Casino should not have changed!");
        }
    });
    it("Owner sets casino => should succeed", async () => {
        await gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
        let result = await gamblingHall.setCasino(someOtherCasino.address, {from: GAMBLING_HALL_OWNER});
        assert.web3Events(result, [
            {
                event: 'CasinoChanged',
                args: {
                    _newCasino: someOtherCasino.address,
                }
            },
        ], 'Event(s) missing!');
        assert.equal(await gamblingHall.casino(), someOtherCasino.address, "SomeOtherCasino should be set!");
    });
});