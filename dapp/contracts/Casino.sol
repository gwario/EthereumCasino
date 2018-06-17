pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "./game/GamblingHall.sol";
import "./bank/CasinoToken.sol";

/**
 * @title Casino
 * @author mariogastegger
 * @dev The casino.
 */
contract Casino is RBAC, ERC223Receiver {
    using SafeMath for uint256;

    /*
     * Events.
     */

    /*
     * Fields.
     */
    string internal constant ROLE_ADMIN = "admin";
    string internal constant ROLE_MANAGER = "manager";

    string constant public name = "New Vegas";

    CasinoToken internal token;
    uint public tokenPrice;

    GamblingHall internal gamingHall;

    bool public opened;


    /**
     * @param _tokenAddress the address of the initial token.
     * @param _gamingHallAddress the address of the initial gaming hall.
     * @param _tokenPrice the initial token price.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice) public {
        require(_tokenAddress != address(0));
        require(_gamingHallAddress != address(0));
        require(_tokenPrice > 0);

        token = CasinoToken(_tokenAddress);
        tokenPrice = _tokenPrice;

        gamingHall = GamblingHall(_gamingHallAddress);

        opened = false;
    }


    /*
     * Modifiers.
     */

    /** @dev Requires the casino to be opened. */
    //TEST:
    modifier isOpened() {
        require(opened);
        _;
    }

    /** @dev Requires the casino to be closed. */
    //TEST:
    modifier isClosed() {
        require(!opened);
        _;
    }


    /*
     * Business function.
     */

    /**
     * @dev Opens the casino.
     */
    //TEST:
    function open() external isClosed onlyRole(ROLE_MANAGER) {
        opened = true;
    }

    /**
     * @dev Closes the casino.
     */
    //TEST:
    function close() external isOpened onlyRole(ROLE_MANAGER) {
        opened = false;

        //TODO stop all games and send feeback
    }

    /**
     * @dev Transfers
     */
    //TEST:
    function buy() external {
        require(0 < msg.value);
        require(msg.value % tokenPrice == 0);


    }

    /**
     * @dev Returns ether for the senders tokens.
     */
    //TEST:
    function payout() external {
        require(address(this).balance > token.balanceOf(msg.sender));
        //TODO
    }

    //dispatches moves to games
    //TEST:
    //@Override
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success) {



    }



    /*
     * Maintenance functions.
     */

    /**
     * @dev Sets a new token.
     * @param _tokenAddress the address of a token.
     */
    //TEST:
    function setToken(address _tokenAddress) external onlyRole(ROLE_ADMIN) isClosed {
        require(_tokenAddress != address(0));

        token = CasinoToken(_tokenAddress);
    }

    /**
     * @dev Sets a token price.
     * @param _tokenPrice the token price.
     */
    //TEST:
    function setTokenPrice(uint _tokenPrice) external onlyRole(ROLE_ADMIN) isClosed {
        require(_tokenPrice > 0);

        tokenPrice = _tokenPrice;
    }

    /**
     * @dev Sets a new gaming hall.
     * @param _gamingHallAddress the address of a gaming hall.
     */
    //TEST:
    function setGamingHall(address _gamingHallAddress) external onlyRole(ROLE_ADMIN) isClosed {
        require(_gamingHallAddress != address(0));

        gamingHall = GamblingHall(_gamingHallAddress);
    }
}
