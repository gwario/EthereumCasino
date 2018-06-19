const CONF = require("../conf.json");
const BigNumber = require('bignumber.js');

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const GamblingHall = artifacts.require("./SimpleGamblingHall.sol");
const SlotMachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");
const Casino = artifacts.require("./NewVegas.sol");

module.exports = function(deployer, network, accounts) {

    const INITIAL_TOKEN_PRICE = new BigNumber(2345678910111213); //about 1€
    const PRODUCTION_AMOUNT = new BigNumber(500);
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
    const SLOTMACHINE_TARGET_BLOCK_OFFSET = new BigNumber(5);

    const CASINO_OWNER = accounts[0];
    const TOKEN_OWNER = accounts[1];
    const GAMBLING_HALL_OWNER = accounts[2];
    const SLOTMACHINE_OWNER = accounts[3];

    let casinoToken;
    let gamblingHall;
    let slotmachine;
    let casino;

    return deployer
        .deploy(CasinoToken, {from: TOKEN_OWNER})
        .then(() => CasinoToken.deployed())
        .catch(error => console.error("2_CasinoToken", error))
        .then(instance => {
            console.debug("2_CasinoToken deployed");
            casinoToken = instance;
            deployer.deploy(GamblingHall, {from: GAMBLING_HALL_OWNER})
            .then(() => GamblingHall.deployed())
            .catch(error => console.error("2_GamblingHall", error))
            .then(instance => {
                console.debug("2_GamblingHall deployed");
                gamblingHall = instance;
                //2 <= _prize, _price < _prize
                //1 <= _price
                //0 <= _deposit
                //10 <= _possibilities
                //3 <= _targetBlockOffset, _targetBlockOffset <= 20
                deployer.deploy(SlotMachine,
                    "Slotmachine1", SLOTMACHINE_PRIZE.toNumber(), SLOTMACHINE_PRICE.toNumber(), SLOTMACHINE_DEPOSIT.toNumber(),
                    SLOTMACHINE_POSSIBILITIES.toNumber(), gamblingHall.address, SLOTMACHINE_TARGET_BLOCK_OFFSET.toNumber(),
                    {from: SLOTMACHINE_OWNER}
                )
                .then(() => SlotMachine.deployed())
                .catch(error => console.error("2_Slotmachine", error))
                .then(instance => {
                    console.debug("2_Slotmachine deployed");
                    slotmachine = instance;
                    deployer.deploy(Casino, casinoToken.address, gamblingHall.address, INITIAL_TOKEN_PRICE.toNumber(), INITIAL_EXCHANGE_FEE.toNumber(), {from: CASINO_OWNER})
                    .then(() => Casino.deployed())
                    .catch(error => console.error("2_Casino", error))
                    .then(instance => {
                        console.debug("2_Casino deployed");
                        casino = instance;
                        casino.send(PRODUCTION_AMOUNT.times(INITIAL_TOKEN_PRICE).toNumber(), {from:CASINO_OWNER});
                        casinoToken.produce(casino.address, PRODUCTION_AMOUNT.toNumber(), {from: TOKEN_OWNER});
                        gamblingHall.setCasino(casino.address, {from: GAMBLING_HALL_OWNER});
                    });
                });
            });
        });
};
