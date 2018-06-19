pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./GamblingHall.sol";
import "./token/CasinoToken.sol";
import "./Casino.sol";

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


    /**
     * @param _tokenAddress the address of the initial token.
     * @param _gamingHallAddress the address of the initial gaming hall.
     * @param _tokenPrice the initial token price.
     * @param _exchangeFee the initial fee for exchanging ether/tokens.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice, uint _exchangeFee)
    Casino(_tokenAddress, _gamingHallAddress, _tokenPrice, _exchangeFee)
    public payable {
        require(token.balanceOf(address(this)).mul(tokenPrice) <= msg.value);//ensure winnings can be cashed out.

        name = "New Vegas";
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
        assert(buyInternal(msg.sender));
    }

    /**
     * @dev Returns ether for the customer tokens.
     * @dev requires a fee.
     */
    //TEST:
    function cashout() external payable {
        assert(cashoutInternal(msg.sender));
    }


    /*
     * Maintenance functions.
     */
}
