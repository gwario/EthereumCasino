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
    /** @dev the owner and beneficiary of the casino */
    string internal constant ROLE_OWNER = "owner";
    /** @dev the operating account */
    string internal constant ROLE_MANAGER = "manager";

    string constant public name;

    CasinoToken public token;
    GamblingHall public gamingHall;

    bool public opened;


    /**
     * @param _tokenAddress the address of the initial token.
     * @param _gamingHallAddress the address of the initial gaming hall.
     * @param _tokenPrice the initial token price.
     * @param _exchangeFee the initial fee for exchanging ether/tokens.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice) internal {
        require(_tokenAddress != address(0));
        require(_gamingHallAddress != address(0));
        require(_tokenPrice > 0);

        token = CasinoToken(_tokenAddress);
        gamingHall = GamblingHall(_gamingHallAddress);

        opened = false;

        addRole(ROLE_OWNER, msg.sender);
        addRole(ROLE_MANAGER, msg.sender);
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

    /** @dev Requires the casino to have a token. */
    //TEST:
    modifier hasToken() {
        require(address(token) != address(0));
        _;
    }


    /*
     * Business function.
     */

    /**
     * @dev Opens the casino.
     */
    //TEST:
    function open() external isClosed hasToken onlyRole(ROLE_MANAGER) {
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
     * @dev Transfers tokens to the customer.
     * @dev requires a fee.
     */
    //TEST:
    function buy(uint exchangeFee) internal payable returns (bool) {
        require(0 < msg.value);
        uint paidFee = msg.value % tokenPrice;
        uint boughtTokens = msg.value.div();
        require(msg.value % tokenPrice == exchangeFee);
        //calc tokens and check token dependent fee
        //TODO transfer from the casino contract to the customer TOKENS
        //TODO use tx.origin

        return true;
    }

    /**
     * @dev Returns ether for the customer tokens.
     * @dev requires a fee.
     */
    //TEST:
    function cashout(uint exchangeFee) internal payable returns (bool) {
        require(address(this).balance > token.balanceOf(tx.origin));
        //TODO check balance at bank and burn tokens and pay out minus fee
        //TODO transfer from the casino to the customer ETHER

        return true;
    }


    /**
     * @dev Payout to beneficiary.
     */
    //TEST:
    function payout() external onlyRole(ROLE_OWNER) {
        //TODO check if enough mony remains to payout all customers.
        //TODO transfer to the beneficiary ETHER
    }

    //TODO do we need this?
    /** @dev has to be implmented by a casino to handle prize payout and stuff... */
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success);


    /**
     * @dev Pays the win to the winner.
     * @param _customer the winner.
     * @param _prize the prize.
     */
    function payOutWin(address _customer, uint _prize) returns (bool) {
        //TODO make sure only the games can call this!
        //TODO or pass the call to the hall and then to the casino
        ...gamingHall.getGames();
        return token.transfer(_customer, _prize);
    }

    /*
     * Maintenance functions.
     */

    /**
     * @dev adds an operating manager.
     * @param _manager the manager's address.
     */
    //TEST:
    function addManager(address _manager) external onlyRole(ROLE_OWNER) {
        require(_manager != address(0));

        addRole(ROLE_MANAGER, _manager);
    }

    /**
     * @dev removes an operating manager.
     * @param _manager the manager's address.
     */
    //TEST:
    function removeManager(address _manager) external onlyRole(ROLE_OWNER) {
        removeRole(ROLE_MANAGER, _manager);
    }

    /**
     * @dev Sets a new token.
     * @param _tokenAddress the address of a token.
     */
    //TEST:
    function setToken(address _tokenAddress) external isClosed onlyRole(ROLE_MANAGER) {
        require(_tokenAddress != address(0));

        token = CasinoToken(_tokenAddress);
    }

    /**
     * @dev Sets a token price.
     * @param _tokenPrice the token price.
     */
    //TEST:
    function setTokenPrice(uint _tokenPrice) external isClosed onlyRole(ROLE_MANAGER) {
        require(_tokenPrice > 0);

        tokenPrice = _tokenPrice;
    }

    /**
     * @dev Sets a new gaming hall.
     * @param _gamingHallAddress the address of a gaming hall.
     */
    //TEST:
    function setGamingHall(address _gamingHallAddress) external onlyRole(ROLE_MANAGER) isClosed {
        require(_gamingHallAddress != address(0));

        gamingHall = GamblingHall(_gamingHallAddress);
    }
}
