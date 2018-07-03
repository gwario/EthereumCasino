pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "../GamblingHall.sol";

/**
 * @title Game
 * @author mariogastegger
 * @dev Interface which must be implemented by games in order to be compatible.
 * @dev Games have to transfer the tokens all received tokens to the casino!
 */
contract Game is RBAC {

    /*
     * Events.
     */

    /**
     * @dev Emitted when the game is played.
     * @param _customer the customer, i.e. the gambler.
     */
    event Played(address _customer);

    /**
     * @dev Emitted when the customer has won at the game.
     * @param _customer the customer, i.e. the gambler.
     * @param _prize the prize which was won.
     */
    event CustomerWon(address _customer, uint _prize);

    /**
     * @dev Emitted when the customer has lost a the the game.
     * @param _customer the customer, i.e. the gambler.
     */
    event CustomerLost(address _customer);

    /**
     * @dev Emitted when the game is hold.
     */
    event Hold();

    /**
     * @dev Emitted when the game is available again.
     */
    event Released();

    /**
     * @dev Emitted when the parameter of a game changed.
     * @param _parameter    the parameter.
     * @param _newValue     the new value of the parameter.
     */
    event ParameterChanged(string _parameter, uint _newValue);

    /**
     * @dev Emitted when the gambling hall changed.
     * @param _newGamblingHall  the new gambling hall.
     */
    event GamblingHallChanged(address _newGamblingHall);


    /*
     * Fields.
     */

    /** @dev The superviser of this game. Collects unclaimed prizes */
    string constant public ROLE_SUPERVISER = "superviser";

    address public superviser;

    GamblingHall public gamblingHall;

    /** @dev whether this game is currently available. */
    bool public available;

    /** @dev the game's type. */
    bytes8 public gameType;

    /** @dev the game's name. This is set when adding it to a hall. */
    bytes32 public name;

    //TEST:
    constructor(bytes8 _gameType, address _gamblingHallAddress) internal {
        require(_gamblingHallAddress != address(0));

        gamblingHall = GamblingHall(_gamblingHallAddress);

        addRole(msg.sender, ROLE_SUPERVISER);
        superviser = msg.sender;

        available = false;
        gameType = _gameType;
    }


    /*
     * Modifiers.
     */

    /** @dev requires the game to be available and the casino to be opened. */
    //TEST:
    modifier isAvailable() {
        require(gamblingHall.casino().opened() && available);
        _;
    }
    /** @dev requires the game not to be available or the casino to be closed. */
    //TEST:
    modifier isNotAvailable() {
        require(!gamblingHall.casino().opened() || !available);
        _;
    }
    /** @dev requires the sender to be the gambling hall. */
    //TEST:
    modifier isGamblingHall() {
        require(msg.sender == address(gamblingHall));
        _;
    }

    /*
     * Business functions.
     */

    /**
     * @dev makes this game available to the public.
     */
    //TEST:
    function release() external isNotAvailable onlyRole(ROLE_SUPERVISER) {
        available = true;

        emit Released();
    }

    /**
     * @dev makes this game unavailable to the public.
     */
    //TEST:
    function hold() external isAvailable onlyRole(ROLE_SUPERVISER) {
        available = false;

        emit Hold();
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev Sets a new gambling hall.
     * @param _gamblingHallAddress the address of a gambling hall.
     */
    //TEST:
    function setGamblingHall(address _gamblingHallAddress) external isNotAvailable onlyRole(ROLE_SUPERVISER) {
        require(_gamblingHallAddress != address(0));

        gamblingHall = GamblingHall(_gamblingHallAddress);

        emit GamblingHallChanged(_gamblingHallAddress);
    }

    /**
     * @dev Sets a name of the game. This is set when adding the game to the gambling hall.
     * @param _name the name of the game.
     */
    //TEST:
    function setName(bytes32 _name) external isNotAvailable isGamblingHall {
        name = _name;
    }
}
