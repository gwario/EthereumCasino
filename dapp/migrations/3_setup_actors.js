const CONF = require("../conf.json");


module.exports = function(deployer, network, accounts) {

    const CASINO_OWNER = accounts[0];
    const TOKEN_OWNER = accounts[1];
    const GAMBLING_HALL_OWNER = accounts[2];
    const SLOTMACHINE_OWNER = accounts[3];

    if(CONF.DEVEL) {

        //TODO assign roles
        // const ROLE_BARKEEPER = "barkeeper";
        // const ROLE_DJ = "dj";
        //
        // const barkeeper1 = accounts[2];
        // const dj1 = accounts[3];
        // const dj2 = accounts[4];
        // CasinoToken.deployed()
        //     .then(instance => {
        //         instance.produce(casinoOwner, initialTokenSupply, {from: tokenOwner})
        //     })
        //     .catch(error => console.error("CasinoToken", error));
        // Casino.deployed()
        //     .then(instance => {
        //         instance.setTokenPrice(initialTokenPrice, {from: casinoOwner});
        //     })
        //     .catch(error => console.error("Casino", error));
        //
        // await beerBar.adminAddRole(barkeeper1, ROLE_BARKEEPER, {from: barowner});
        //
        // await beerBar.adminAddRole(dj1, ROLE_DJ, {from: barowner});
        // await beerBar.adminAddRole(dj2, ROLE_DJ, {from: barowner});
    }
};
