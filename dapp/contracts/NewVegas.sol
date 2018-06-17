pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./game/GamblingHall.sol";
import "./bank/CasinoToken.sol";

/**
 * @title NewVegas
 * @author mariogastegger
 * @dev The casino.
 */
contract NewVegas is Casino {
    using SafeMath for uint256;

    /*
     * Events.
     */

    /*
     * Fields.
     */
    /** @dev fee which has to be paid for every token/ether exchange. */
    uint public exchangeFee;

    /**
     * @param _tokenAddress the address of the initial token.
     * @param _gamingHallAddress the address of the initial gaming hall.
     * @param _tokenPrice the initial token price.
     * @param _exchangeFee the initial fee for exchanging ether/tokens.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice, uint _exchangeFee)
    Casino(_tokenAddress, _gamingHallAddress, _tokenPrice)
    public {

        name = "New Vegas";
        exchangeFee = _exchangeFee;
    }

    /*
     * Modifiers.
     */

    /*
     * Business function.
     */

    /**
     * @dev Transfers tokens to the customer.
     * @dev requires a fee.
     */
    //TEST:
    function buy() external payable {
        assert(buy(exchangeFee));
    }

    /**
     * @dev Returns ether for the customer tokens.
     * @dev requires a fee.
     */
    //TEST:
    function cashout() external payable {
        assert(cashout(exchangeFee));
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev Sets a token price.
     * @param _tokenPrice the token price.
     */
    //TEST:
    function setExchangeFee(uint _exchangeFee) external isClosed onlyRole(ROLE_MANAGER) {
        exchangeFee = _exchangeFee;
    }
}
