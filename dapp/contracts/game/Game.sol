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
     * Fields.
     */

    /** @dev The superviser of this game. Collects unclaimed prizes */
    string constant public ROLE_SUPERVISER = "superviser";

    GamblingHall public gamblingHall;

    /** @dev whether this game is currently available. */
    bool public available;


    constructor(address _gamblingHallAddress) internal {
        require(_gamblingHallAddress != address(0));

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
