# Final Project
## Topic
Choose a topic to your liking for your own project.  
If you have no preference for any topic, you may build on the TU beer bar by either replacing parts and/or extending the existing project. This could be a pub quiz, an extended beer supply, or an extended voting board for example.

## Grading
We will grade the project according to the following aspects (requirements):

1. use
	-   mapping(s)
	*   roles with RBAC (at least 1 beyond ROLE_OWNER)
	*   modifier(s) (at least only_owner)
	-   ether
	-   token
	-   correct math (big numbers, overflow)
	-   a (minimalistic) web interface for interaction with the contract
2. ensure that  
	-   no ether is lost
	-   no token is lost
	-   the contract can’t be depleted by any method used in the challenges (fallback, constructor, reentrancy, overflow, delegatecall, forced ether, etc.)

3. provide
	-   a specification (apart from code) of what your project/contract is supposed to achieve
	-   the address(es) of your contract(s)
	-   the Solidity code
	-   the web interface

Furthermore, there will be a bonus for using (optional, i.e. you can get full points without this):  
	-   commitments for secrets (e.g. bidding, game move)
	-   deposits for games to prevent aborts/reverts
	-   timeouts to ensure move/game termination
	-   good randomness

## Submission
Upload the specification and the source code as one zipped file.  

Publish the address of your main contract at slot ´100´ of the private address book. If you use further contracts, publish them in the subsequent slots (´101´ to ´105´).  

`(addresses.setPrivate.sendTransaction(slot, "0x...", {from: eth.accounts[0]}))`