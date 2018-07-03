pragma solidity ^0.4.23;

import "./Mintable223Token.sol";
import "./Burnable223Token.sol";
import "./DetailedERC20Basic.sol";


/**
 * @title Bank
 * @author mariogastegger
 * @dev The token provider for a casino.
 */
contract CasinoToken is Burnable223Token, Mintable223Token, DetailedERC20Basic("Chip", "💰", 0) {

    /*
     * Events.
     */

    /**
     * @dev Emitted when the production of tokens was finished.
     * @param _owner    the owner of the produced tokens.
     * @param _amount   the produced amount.
     */
    event ProductionFinished(address indexed _owner, uint256 _amount);

    /*
     * Fields.
     */

    /*
     * Business functions.
     */

    /**
     * @dev Produces chips for a casino.
     * @param _casinoAddress    the casino.
     * @param _amount           the amount of tokens.
     */
    //TEST:
    function produce(address _casinoAddress, uint256 _amount) public onlyOwner returns (bool success) {
        require(_casinoAddress != address(0));
        require(_amount > 0);

        assert(mint(owner, _amount));
        assert(transfer(_casinoAddress, _amount, "production"));

        success = true;

        emit ProductionFinished(_casinoAddress, _amount);
    }
}
