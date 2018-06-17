pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Casino.sol";

/**
 * @title FirstGamblingHall
 * @author mariogastegger
 * @dev An actual gambling hall.
 */
contract FirstGamblingHall is GamblingHall {
    using SafeMath for uint;


    /*
     * Events.
     */

    /*
     * Fields.
     */

    /*
     * Modifiers.
     */

    /*
     * Business functions.
     */

    /**
     * @dev Adds a game.
     * @param _gameName the name of the game.
     * @param _gameType the type of the game.
     * @param _gameAddress the address of the game.
     */
    //TEST:
    function addGame(bytes32 _gameName, bytes8 _gameType, address _gameAddress) external hasCasino onlyRole(ROLE_MANAGER) {
        assert(addGameInternal(_gameName, _gameType, _gameAddress));
    }

    /**
     * @dev Removes a game.
     * @param _name the name of the game to be removed.
     */
    //TEST:
    function removeGame(bytes32 _name) external onlyRole(ROLE_MANAGER) {
        assert(removeInternal(_name));
    }

    /**
     * @return all games.
     */
    //TEST:
    function getGames() external view returns (bytes32[]) {
        return getGamesInternal();
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev sets the casino.
     * @param _casinoAddress the casino address.
     */
    function setCasino(address _casinoAddress) {
        require(_casinoAddress != address(0));

        casino = Casino(_casinoAddress);
    }
}
