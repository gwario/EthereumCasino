pragma solidity ^0.4.23;

/**
 * @title GameOfChance
 * @author mariogastegger
 * @dev Interface which must be implemented by games of chance... e.g. slotmachine, even or odd, ...
 */
contract GameOfChance {

    /*
     * Events.
     */

    /**
     * @dev Indicates, that the game is over.
     */
    event GameOver(address player, bool hasWon);


    /*
     * Business functions.
     */

    /**
     * @dev The lower bound for the stake.
     */
    function minStake() internal returns (uint256);
    /**
     * @dev The upper bound for the stake.
     */
    function maxStake() internal returns (uint256);

    /**
     * @dev Bets in this game.
     */
    function bet(uint _bet) external;

    /**
     * @dev Claims the prize.
     */
    function claim() external;
}
