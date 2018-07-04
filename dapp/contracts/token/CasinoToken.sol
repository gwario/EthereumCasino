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

    /**
     * @dev Emitted when a customer transfers wei from the casino, i.e. he sells tokens.
     * @param _owner    the customer.
     * @param _value    the value.
     */
    event CustomerPaidOut(address indexed _owner, uint _value);

    /**
     * @dev Emitted when the casino receives tokens.
     * @param _sender           the sender.
     * @param _casinoAddress    the casino.
     * @param _value            the value.
     */
    event RevenueReceived(address indexed _sender, address indexed _casinoAddress, uint _value);


    /*
     * Fields.
     */
    bytes public constant TOKEN_TRANSFER_DATA_PRODUCTION = "tokenProduction";
    bytes public constant TOKEN_TRANSFER_DATA_CASH_OUT = "tokenCashout";
    bytes public constant TOKEN_TRANSFER_DATA_REVENUE = new bytes(0);

    /*
     * Business functions.
     */

    /**
     * @dev Produces chips for a casino.
     * @param _casinoAddress    the casino.
     * @param _amount           the amount of tokens.
     */
    //TEST: DONE
    function produce(address _casinoAddress, uint256 _amount) public onlyOwner {
        require(_casinoAddress != address(0));
        require(_amount > 0);

        assert(mint(owner, _amount));
        assert(transfer(_casinoAddress, _amount, TOKEN_TRANSFER_DATA_PRODUCTION));

        emit ProductionFinished(_casinoAddress, _amount);
    }

    //TEST: DONE
    function cashout(address _casinoAddress, uint256 _amount) public {
        require(_casinoAddress != address(0));
        require(_amount > 0);

        assert(transfer(_casinoAddress, _amount, TOKEN_TRANSFER_DATA_CASH_OUT));

        emit CustomerPaidOut(msg.sender, _amount);
    }

    //TEST: DONE
    function sendRevenue(address _casinoAddress, uint256 _amount) public {
        require(_casinoAddress != address(0));
        require(_amount > 0);

        assert(transfer(_casinoAddress, _amount, TOKEN_TRANSFER_DATA_REVENUE));

        emit RevenueReceived(msg.sender, _casinoAddress, _amount);
    }
}
