const CONF = require("../conf.json");

const CasinoToken = artifacts.require("./bank/CasinoToken.sol");
const SlotMachine = artifacts.require("./game/AllOrNothingSlotmachine.sol");
const Casino = artifacts.require("./Casino.sol");

module.exports = function(deployer, network, accounts) {

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

            CasinoToken.deployed()
                .then(casinoToken => {
                    casinoToken.produce(CASINO_OWNER, 140000, {from: TOKEN_OWNER});
                })
                .catch(error => console.error("4_CasinoToken", error));
            //calling functions of other contracts in this way did not work for some reason...
            //the contract has not yet been deployed...
        }
    }
};
