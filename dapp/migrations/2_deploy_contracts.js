const CONF = require("../conf.json");
const BigNumber = require('bignumber.js');
const fs = require('fs');

const casinoMetaDataFile = `${__dirname}/../build/contracts/NewVegas.json`;
const casinoMetaData = require(casinoMetaDataFile);

const gamblingHallMetaDataFile = `${__dirname}/../build/contracts/SimpleGamblingHall.json`;
const gamblingHallMetaData = require(gamblingHallMetaDataFile);

const slotmachineMetaDataFile = `${__dirname}/../build/contracts/AllOrNothingSlotmachine.json`;
const slotmachineMetaData = require(slotmachineMetaDataFile);


const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const GamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const SlotMachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");

const Casino = artifacts.require("./NewVegas.sol");

module.exports = function(deployer, network, accounts) {

    const INITIAL_TOKEN_PRICE = new BigNumber(2345678910111213); //about 1€
    const PRODUCTION_AMOUNT = new BigNumber(500);
    const CASINO_ETHER = INITIAL_TOKEN_PRICE.times(PRODUCTION_AMOUNT);
    const INITIAL_EXCHANGE_FEE = new BigNumber(0);

    //2 <= _prize, _price < _prize
    //1 <= _price
    //0 <= _deposit
    //10 <= _possibilities
    //3 <= _targetBlockOffset, _targetBlockOffset <= 20
    const SLOTMACHINE_PRIZE = new BigNumber(45);
    const SLOTMACHINE_PRICE = new BigNumber(5);
    const SLOTMACHINE_DEPOSIT = new BigNumber(5);
    const SLOTMACHINE_POSSIBILITIES = new BigNumber(10);
    const SLOTMACHINE_TARGET_BLOCK_OFFSET = new BigNumber(3);

    const CASINO_OWNER = accounts[0];
    const TOKEN_OWNER = accounts[1];
    const GAMBLING_HALL_OWNER = accounts[2];
    const SLOTMACHINE_SUPERVISER = accounts[3];

    const CASINO_MANAGER = accounts[5];
    const GAMBLING_HALL_MANAGER = accounts[6];

    let casinoToken;
    let gamblingHall;
    let slotmachine;
    let casino;

    return deployer
        .deploy(CasinoToken, {from: TOKEN_OWNER})
        .then(function() { return CasinoToken.deployed(); })
        .catch(function(error) { console.error("2_CasinoToken", error); })
        .then(function(instance) {
            console.debug("2_CasinoToken deployed");
            casinoToken = instance;
            deployer.deploy(GamblingHall, {from: GAMBLING_HALL_OWNER})
            .then(function() { return GamblingHall.deployed(); })
            .catch(function(error) { console.error("2_GamblingHall", error); })
            .then(function(instance) {
                console.debug("2_GamblingHall deployed");
                gamblingHall = instance;
                //2 <= _prize, _price < _prize
                //1 <= _price
                //0 <= _deposit
                //10 <= _possibilities
                //3 <= _targetBlockOffset, _targetBlockOffset <= 20
                deployer.deploy(SlotMachine,
                    SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
                    SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
                    {from: SLOTMACHINE_SUPERVISER}
                )
                .then(function() { return SlotMachine.deployed(); })
                .catch(function(error) { console.error("2_Slotmachine", error); })
                .then(function(instance) {
                    console.debug("2_Slotmachine deployed");
                    slotmachine = instance;
                    deployer.deploy(Casino, casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(), {from: CASINO_OWNER})
                    .then(function() { return Casino.deployed(); })
                    .catch(function(error) { console.error("2_Casino", error); })
                    .then(function(instance) {
                        console.debug("2_Casino deployed");
                        casino = instance;
                        casino.setManager(CASINO_MANAGER, {from:CASINO_OWNER});
                        casino.stockup({from:CASINO_OWNER, value: CASINO_ETHER.toNumber()});
                        casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
                        gamblingHall.setManager(GAMBLING_HALL_MANAGER, {from:GAMBLING_HALL_OWNER});
                        gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_MANAGER});
                        gamblingHall.addGame("All-Or-Nothing Slotmachine", slotmachine.address, {from: GAMBLING_HALL_MANAGER});
                        casino.open({from: CASINO_MANAGER});
                        slotmachine.release({from: SLOTMACHINE_SUPERVISER});

                        casinoMetaData.networks[deployer.network_id] = {};
                        casinoMetaData.networks[deployer.network_id].address = casino.address;
                        fs.writeFileSync(casinoMetaDataFile, JSON.stringify(casinoMetaData, null, 4));

                        gamblingHallMetaData.networks[deployer.network_id] = {};
                        gamblingHallMetaData.networks[deployer.network_id].address = gamblingHall.address;
                        fs.writeFileSync(gamblingHallMetaDataFile, JSON.stringify(gamblingHallMetaData, null, 4));

                        slotmachineMetaData.networks[deployer.network_id] = {};
                        slotmachineMetaData.networks[deployer.network_id].address = slotmachine.address;
                        fs.writeFileSync(slotmachineMetaDataFile, JSON.stringify(slotmachineMetaData, null, 4));
                    });
                });
            });
        });
};
