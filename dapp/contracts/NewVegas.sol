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
     * @param _exchangeFee the initial fee for exchanging wei/tokens.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice, uint _exchangeFee)
    Casino(_tokenAddress, _gamingHallAddress, _tokenPrice, _exchangeFee)
    public {
        name = "New Vegas";
    }

    /*
     * Modifiers.
     */

    /*
     * Business function.
     */

    /**
     * TODO consider putting this along with other token related functions to another contract e.g. bank!
     * @dev Transfers tokens to the customer.
     * @dev requires a fee.
     */
    //TEST: DONE
    function buyTokens() external payable {
        assert(buyInternal(msg.sender));
    }

    /**
     * @dev Has to be implemented by a casino. The transfer has already taken place. Serious errors should revert.
     * @dev To act on received price money,
     * @dev To act on produced tokens
     * @dev To act on customer token cash-out
     * @param _sender the sender.
     * @param _origin the previous owner of the tokens.
     * @param _value the amount of tokens.
     * @param _data the supplied data.
     * @return true on success, otherwise false.
     */
    //TEST:
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success) {
        require(msg.sender == address(token));

        if(keccak256(_data) == keccak256(token.TOKEN_TRANSFER_DATA_PRODUCTION())) {

            success = handleTokenProduction();

        } else if(keccak256(_data) == keccak256(token.TOKEN_TRANSFER_DATA_CASH_OUT())) {

            success = handleTokenCashout(_origin, _value);

        } else if(keccak256(_data) == keccak256(token.TOKEN_TRANSFER_DATA_REVENUE())) {

            success = handleTokenReception(_sender, _origin, _value);

        } else {

            success = false;
        }

        if(!success) {
            revert();
        }
    }


    /*
     * Maintenance functions.
     */
}
