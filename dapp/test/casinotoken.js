// require('truffle-test-utils').init();
//
// const BeerToken = artifacts.require("./BeerToken.sol");
// const BeerBar = artifacts.require("./BeerBar.sol");
//
// contract('BeerBar voting', function (accounts) {
//
//     let tokenPrice = 1200000000000;
//     let barowner = accounts[0];
//     let tokenowner = accounts[1];
//     let barkeeper = accounts[2];
//     let dj = accounts[3];
//     let customer = accounts[4];
//     let beerToken;
//     let beerBar;
//
//     let delivery = 200;
//
//
//     beforeEach(async() => {
//         //supply, openbar
//         beerToken = await BeerToken.new({from: tokenowner});
//         beerBar = await BeerBar.new(beerToken.address, tokenPrice, {from: barowner});
//
//         await beerBar.adminAddRole(barkeeper, "barkeeper", {from: barowner});
//         await beerBar.adminAddRole(dj, "dj", {from: barowner});
//
//
//         let isOpen = await beerBar.barIsOpen();
//         assert.equal(isOpen, false, "bar should be closed at this time!");
//
//         await beerBar.openBar({from: barkeeper});
//
//         isOpen = await beerBar.barIsOpen();
//         assert.equal(isOpen, true, "bar should be open!");
//
//         await beerToken.brewFor(barowner, delivery, {from: tokenowner});
//         assert.equal(await beerToken.totalSupply(), delivery, "Supply should have been created!");
//         assert.equal(await beerToken.balanceOf(barowner), delivery, "Delivery should be at the barowner!");
//         assert.equal(await beerToken.balanceOf(tokenowner), 0, "Delivery should be at the bar owner!");
//         assert.equal(await beerToken.balanceOf(beerBar.address), 0, "Delivery should not be at the bar yet!");
//
//         await beerToken.supply(beerBar.address, delivery, {from: barowner});
//         assert.equal(await beerToken.totalSupply(), delivery, "Supply should still be here!");
//         assert.equal(await beerToken.balanceOf(barowner), 0, "Delivery should be at the bar!");
//         assert.equal(await beerToken.balanceOf(tokenowner), 0, "Delivery should be at the bar!");
//         assert.equal(await beerToken.balanceOf(beerBar.address), delivery, "Delivery should be at the beerbar!");
//     });
//
//     it("Owner allow voting => should revert", async () => {
//         try {
//             assert.notEqual(dj, barowner, "DJ should be different from Owner");
//             assert.equal(await beerBar.hasRole(barowner, "dj"), false, "Owner should not be dj!");
//
//             await beerBar.startVoting({from: barowner});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//     it("Barkeeper allow voting => should revert", async () => {
//         assert.notEqual(dj, barkeeper, "DJ should be different from Barkeeper");
//         try {
//             await beerBar.startVoting({from: barkeeper});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//     it("Dj allow voting => should succeed", async () => {
//         let result = await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//         assert.web3Event(result, {
//             event: 'VotingAllowed',
//         }, 'Event are missing!');
//     });
//
//     it("Bar closed -> Dj allow voting => should revert", async () => {
//
//         let isOpen = await beerBar.barIsOpen();
//         assert.equal(isOpen, true, "bar should be open at this time!");
//
//         await beerBar.closeBar({from: barkeeper});
//
//         isOpen = await beerBar.barIsOpen();
//         assert.equal(isOpen, false, "bar should be closed now!");
//
//         try {
//             await beerBar.startVoting({from: dj});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//
//     it("allow voting -> owner stop voting => should revert", async () => {
//
//         let result = await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//         assert.web3Event(result, {
//             event: 'VotingAllowed',
//         }, 'Event are missing!');
//
//         try {
//             await beerBar.stopVoting({from: barowner});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//
//
//     });
//
//     it("allow voting -> customer stop voting => should revert", async () => {
//
//         let result = await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//         assert.web3Event(result, {
//             event: 'VotingAllowed',
//         }, 'Event are missing!');
//
//         try {
//             await beerBar.stopVoting({from: customer});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//
//
//     });
//
//     it("allow voting -> barkeeper stop voting => should revert", async () => {
//
//         let result = await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//         assert.web3Event(result, {
//             event: 'VotingAllowed',
//         }, 'Event are missing!');
//
//         try {
//             await beerBar.stopVoting({from: barkeeper});
//             assert.fail(null, null, "Should not be reached!");
//         } catch(err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//
//     it("allow voting -> stop voting => should be stopped", async () => {
//
//         let result = await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//         assert.web3Event(result, {
//                 event: 'VotingAllowed',
//             }, 'Event are missing!');
//
//         result = await beerBar.stopVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), false, "Voting should not be allowed anymore!");
//         assert.web3Event(result, {
//             event: 'VotingProhibited',
//         }, 'Event are missing!');
//
//     });
//
//     var fromAscii = function(str, num) {
//         var hex = "";
//         for(var i = 0; i < str.length; i++) {
//             var code = str.charCodeAt(i);
//             var n = code.toString(16);
//             hex += n.length < 2 ? '0' + n : n;
//         }
//
//         return "0x" + hex.padEnd(num,'0');
//     };
//
//     it("customer votes for song => should succeed", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         assert.equal(await beerBar.votingIsAllowed(), true, "Voting should be allowed now!");
//
//         let result = await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//         assert.web3Event(result, {
//             event: 'NewVote',
//             args: {
//                 title: fromAscii(songTitle, 64),
//                 vote: 10*tokenPrice
//             }
//         }, 'Event are missing!');
//     });
//
//     it("customer votes for song => vote should be present", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//
//         let balance = await beerToken.balanceOf(customer);
//         assert.equal(balance, 10, "Customer should have got tokens.");
//         assert.deepEqual(await beerBar.getPlaylist(), [fromAscii(songTitle, 64)], "Should return the one song.");
//         assert.equal(await beerBar.getVotesFor(songTitle), 10*tokenPrice, "There should be votes now...");
//     });
//
//     it("customer votes for song -> votes again => vote should be present", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//         await beerBar.vote(songTitle, {from: customer, value: 2*tokenPrice});
//
//         let balance = await beerToken.balanceOf(customer);
//         assert.equal(balance, 12, "Customer should have got tokens.");
//         assert.deepEqual(await beerBar.getPlaylist(), [fromAscii(songTitle, 64)], "Should return the one song.");
//         assert.equal(await beerBar.getVotesFor(songTitle), 12*tokenPrice, "There should be more votes now...");
//     });
//
//     it("dj play existing song => send event", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//         let result = await beerBar.playSong(songTitle, {from: dj});
//         assert.web3Event(result, {
//             event: 'PlayingSong',
//             args: {
//                 title: fromAscii(songTitle, 64),
//             }
//         }, 'Event are missing!');
//
//         assert.equal(web3.toUtf8(await beerBar.getCurrentSong()), songTitle, "Should be the played song.");
//     });
//
//     it("play song => should not be in playlist anymore", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//         await beerBar.playSong(songTitle, {from: dj});
//
//         assert.deepEqual(await beerBar.getPlaylist(), [], "Should return empty list.");
//
//         try {
//             await beerBar.getVotesFor(songTitle);
//             assert.fail(null, null, "Should not be reached!");
//         } catch (err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//
//     it("dj play non existing song => should revert", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//
//         try {
//             await beerBar.playSong(songTitle+"asdasd", {from: dj});
//             assert.fail(null, null, "Should not be reached!");
//         } catch (err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//
//     it("owner play song => should revert", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//
//         try {
//             await beerBar.playSong(songTitle, {from: barowner});
//             assert.fail(null, null, "Should not be reached!");
//         } catch (err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//     it("barkeeper play song => should revert", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//
//         try {
//             await beerBar.playSong(songTitle, {from: barkeeper});
//             assert.fail(null, null, "Should not be reached!");
//         } catch (err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
//
//     it("customer play song => should revert", async () => {
//
//         let songTitle = "TestSong";
//         await beerBar.startVoting({from: dj});
//         await beerBar.vote(songTitle, {from: customer, value: 10*tokenPrice});
//
//         try {
//             await beerBar.playSong(songTitle, {from: customer});
//             assert.fail(null, null, "Should not be reached!");
//         } catch (err) {
//             assert.equal(err.message, "VM Exception while processing transaction: revert", "VM error expected");
//         }
//     });
// });
