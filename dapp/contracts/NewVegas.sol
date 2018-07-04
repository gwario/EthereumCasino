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
    string public constant TOKEN_TRANSFER_DATA_PRODUCTION = "tokenProduction";
    string public constant TOKEN_TRANSFER_DATA_CASH_OUT = "tokenCashout";
    bytes private constant TOKEN_TRANSFER_DATA_RECEPTION = new bytes(0);

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
     * @dev Transfers tokens to the customer.
     * @dev requires a fee.
     */
    //TEST: DONE
    function buyTokens() external payable {
        assert(buyInternal(msg.sender));
    }

    /**
     * @dev Returns wei for the customer tokens.
     * @dev requires a fee.
     * @dev this is deprecated! Use CasinoToken.transfer(casino,value,"cashoutTokens")
     */
    //TEST: DONE
    function cashout() external payable isOpened returns (bool success) {
//        uint customerTokens = token.balanceOf(msg.sender);
//        require(0 < customerTokens);
//
//        //check balance of the casino
//        uint customerEtherForTokens = customerTokens.mul(tokenPrice);
//        require(customerEtherForTokens.sub(exchangeFee) <= address(this).balance);
//
//        //transfer tokens back to casino
//        require(token.transfer(address(this), customerTokens));
//        //transfer from the casino to the customer and minus fee
//        msg.sender.transfer(customerEtherForTokens.sub(exchangeFee));
//
//        emit CustomerPaidOut(msg.sender, customerTokens);
//        emit EtherBalanceChanged(address(this).balance);
//
//        success = true;
        revert();
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

        if(keccak256(_data) == keccak256(TOKEN_TRANSFER_DATA_PRODUCTION)) {

            success = handleTokenProduction();

        } else if(keccak256(_data) == keccak256(TOKEN_TRANSFER_DATA_CASH_OUT)) {

            success = handleTokenCashout(_origin, _value);

        } else if(keccak256(_data) == keccak256(TOKEN_TRANSFER_DATA_RECEPTION)) {

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
