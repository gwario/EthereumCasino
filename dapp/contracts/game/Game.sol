pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "../bank/CasinoToken.sol";
import "./GamblingHall.sol";

/**
 * @title Game
 * @author mariogastegger
 * @dev Interface which must be implemented by games in order to be compatible.
 */
contract Game is RBAC {

    /*
     * Events.
     */

    /**
     * @dev Emitted when the game is played.
     * @param _customer the customer, i.e. the gambler.
     * @param _game the name of the game.
     */
    event CustomerPlays(address _customer, bytes32 _game);

    /**
     * @dev Emitted when the customer has won at the game.
     * @param _customer the customer, i.e. the gambler.
     * @param _game the name of the game.
     * @param _prize the prize which was won.
     */
    event CustomerWon(address _customer, bytes32 _game, uint _prize);

    /**
     * @dev Emitted when the customer has lost a the the game.
     * @param _customer the customer, i.e. the gambler.
     * @param _game the name of the game.
     */
    event CustomerLost(address _customer, bytes32 _game);


    /*
     * Fields.
     */

    /** @dev The superviser of this game. Collects unclaimed prizes */
    string constant public ROLE_SUPERVISER = "superviser";

    GamblingHall public gamblingHall;

    bytes32 public name;

    /** @dev whether this game is currently available. */
    bool public available;


    constructor(bytes32 _name, address _gamblingHallAddress) internal {
        require(_gamblingHallAddress != address(0));

        name = _name;
        gamblingHall = GamblingHall(_gamblingHallAddress);

        addRole(msg.sender, ROLE_SUPERVISER);

        available = false;
    }


    /*
     * Modifiers.
     */

    /** @dev requires the game to be available. */
    modifier isAvailable() {
        require(available);
        _;
    }
    /** @dev requires the game not to be available. */
    modifier isNotAvailable() {
        require(!available);
        _;
    }


    /*
     * Business functions.
     */

    /**
     * @dev makes this game available to the public.
     */
    function release() external isNotAvailable onlyRole(ROLE_SUPERVISER) {
        available = true;
    }

    /**
     * @dev makes this game unavailable to the public.
     */
    function hold() external isAvailable onlyRole(ROLE_SUPERVISER) {
        available = false;
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev Sets a new gambling hall.
     * @param _gamblingHallAddress the address of a gambling hall.
     */
    function setGamblingHall(address _gamblingHallAddress) external isNotAvailable onlyRole(ROLE_SUPERVISER) {
        require(_gamblingHallAddress != address(0));

        gamblingHall = GamblingHall(_gamblingHallAddress);
    }
}
