const CONF = require("../conf.json");

const CasinoToken = artifacts.require("./token/CasinoToken.sol");
const SlotMachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");
const Casino = artifacts.require("./NewVegas.sol");
const GamblingHall = artifacts.require("./SimpleGamblingHall.sol");

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

    if(network === "production") {

        //TODO setup for submission
        // const ROLE_ADMIN = "admin";
        // const public3Address = "0x6501fe5194f2718e1bfe4aa1897d2bd125330f0b";
        //
        // //supply with 2000 beer tokens
        // await beerToken.brewFor(public3Address, initialTokenSupply, {from: tokenowner});
        // await beerBar.setBeerPrice(initialBeerPrice, {from: barowner});
        //
        // await beerToken.transferOwnership(public3Address, {from: tokenowner});
        // await beerBar.adminAddRole(public3Address, ROLE_ADMIN, {from: barowner});

    } else {

        if (CONF.DEVEL) {
            //Some how does not work...  not deployed... script seems to be executed before deployment succeeded
            //Also some other node error...
            // CasinoToken.deployed()
            //     .then(casinoToken => {
            //         casinoToken.produce(CASINO_OWNER, INITIAL_TOKEN_SUPPLY, {from: TOKEN_OWNER});
            //     })
            //     .catch(error => console.error("4_CasinoToken", error));
            //
            // Casino.deployed()
            //     .then(casino => {
            //         casino.setTokenPrice(INITIAL_TOKEN_PRICE, {from: CASINO_OWNER});
            //     })
            //     .catch(error => console.error("4_Casino", error));
            //
            // SlotMachine.deployed()
            //     .then(slotmachine => {
            //         slotmachine.setPrize(SLOTMACHINE_PRIZE, {from: SLOTMACHINE_OWNER});
            //         slotmachine.setPrice(SLOTMACHINE_PRICE, {from: SLOTMACHINE_OWNER});
            //         slotmachine.setDeposit(SLOTMACHINE_DEPOSIT, {from: SLOTMACHINE_OWNER});
            //         slotmachine.setPossibilities(SLOTMACHINE_POSSIBILITIES, {from: SLOTMACHINE_OWNER});
            //         slotmachine.setTargetBlockOffset(SLOTMACHINE_TARGET_BLOCK_OFFSET, {from: SLOTMACHINE_OWNER});
            //     })
            //     .catch(error => console.error("4_Slotmachine", error))
        }
    }
};
