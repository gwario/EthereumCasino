const CONF = require("../conf.json");

const CasinoToken = artifacts.require("./bank/CasinoToken.sol");
const GamblingHall = artifacts.require("./game/GamblingHall.sol");
const SlotMachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");
const Casino = artifacts.require("./Casino.sol");

module.exports = function(deployer, network, accounts) {

    const INITIAL_TOKEN_PRICE = 2345678910111213; //about 1€
    const INITIAL_TOKEN_SUPPLY = 10000;

    //2 <= _prize, _price < _prize
    //1 <= _price
    //0 <= _deposit
    //10 <= _possibilities
    //3 <= _targetBlockOffset, _targetBlockOffset <= 20
    const SLOTMACHINE_PRIZE = 45;
    const SLOTMACHINE_PRICE = 5;
    const SLOTMACHINE_DEPOSIT = 5;
    const SLOTMACHINE_POSSIBILITIES = 10;
    const SLOTMACHINE_TARGET_BLOCK_OFFSET = 5;

    const CASINO_OWNER = accounts[0];
    const TOKEN_OWNER = accounts[1];
    const GAMBLING_HALL_OWNER = accounts[2];
    const SLOTMACHINE_OWNER = accounts[3];

    return deployer
        .deploy(CasinoToken, {from: TOKEN_OWNER})
        .then(() => CasinoToken.deployed())
        .catch(error => console.error("2_CasinoToken", error))
        .then(casinotoken => {
            console.debug("2_CasinoToken deployed");
            casinotoken.produce(CASINO_OWNER, INITIAL_TOKEN_SUPPLY, {from: TOKEN_OWNER});
            deployer.deploy(GamblingHall, CasinoToken.address, {from: GAMBLING_HALL_OWNER})
            .then(() => GamblingHall.deployed())
            .catch(error => console.error("2_GamblingHall", error))
            .then(gamblinghall => {
                console.debug("2_GamblingHall deployed");
                //2 <= _prize, _price < _prize
                //1 <= _price
                //0 <= _deposit
                //10 <= _possibilities
                //3 <= _targetBlockOffset, _targetBlockOffset <= 20
                deployer.deploy(SlotMachine,
                    SLOTMACHINE_PRIZE, SLOTMACHINE_PRICE, SLOTMACHINE_DEPOSIT,
                    SLOTMACHINE_POSSIBILITIES, CasinoToken.address, SLOTMACHINE_TARGET_BLOCK_OFFSET,
                    {from: SLOTMACHINE_OWNER}
                )
                .then(() => SlotMachine.deployed())
                .catch(error => console.error("2_Slotmachine", error))
                .then(slotmachine => {
                    console.debug("2_Slotmachine deployed");
                    deployer.deploy(Casino, CasinoToken.address, GamblingHall.address, INITIAL_TOKEN_PRICE, {from: CASINO_OWNER})
                    .then(() => Casino.deployed())
                    .catch(error => console.error("2_Casino", error))
                    .then(casino => {
                        console.debug("2_Casino deployed");
                    });
                });
            });
        });
};
