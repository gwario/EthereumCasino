pragma solidity ^0.4.23;

import "./Mintable223Token.sol";
import "./Burnable223Token.sol";

/**
 * @title Bank
 * @author mariogastegger
 * @dev The token provider for a casino.
 */
contract CasinoToken is Burnable223Token, Mintable223Token {

    /*
     * Fields.
     */

    string constant public name = "Chip";
    string public symbol = "💰";
    uint8 public decimals = 0;


    /*
     * Business functions.
     */

    /**
     * @dev Produces chips for a casino.
     */
    //TEST:
    function produce(address _casinoAddress, uint256 _amount) public onlyOwner returns (bool) {
        require(_casinoAddress != address(0));
        require(_amount > 0);

        assert(mint(_casinoAddress, _amount));

        return true;
    }
}
