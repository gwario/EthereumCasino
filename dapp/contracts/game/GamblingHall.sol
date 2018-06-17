pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Casino.sol";
import "./FirstGamblingHall.sol";

/**
 * @title GamblingHall
 * @author mariogastegger
 * @dev Allows for a casino to host games.
 */
contract GamblingHall is RBAC {
    using SafeMath for uint;


    /*
     * Events.
     */

    /*
     * Fields.
     */
    string internal constant ROLE_MANAGER = "manager";

    /**
     * @title GameInfo
     * @dev Holds information about a game.
     * @dev to extend this, create additional fields and an own map an link them to this map.
     */
    struct GameInfo {
        uint256 listPointer;
        address gameAddress;
        bytes32 gameName;
        bytes8 gameType;
        bool isPresent;
    }


    Casino public casino;

    /** @dev Mapping of game name to game info. For extensions of  */
    mapping (bytes32 => GameInfo) nameGame;
    /** @dev List of game names. */
    bytes32[] gameNames;


    constructor() {
        addRole(msg.sender, ROLE_MANAGER);
    }


    /*
     * Modifiers.
     */

    /** @dev requires the casino to be set. */
    modifier hasCasino() {
        require(address(casino) != address(0));
        _;
    }

    /** @dev requires the token to be set. */
    modifier hasToken() {
        require(address(casino) != address(0));
        require(address(casino.token()) != address(0));
        _;
    }


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
    function addGameInternal(bytes32 _gameName, bytes8 _gameType, address _gameAddress) internal hasCasino onlyRole(ROLE_MANAGER) {
        //TODO check game interface...
        //- same bank
        //- type one of

        require(!nameGame[_gameName].isPresent);

        nameGame[_gameName] = GameInfo({
            listPointer: gameNames.length,
            gameName: _gameName,
            gameType: _gameType,
            gameAddress: _gameAddress,
            isPresent: true
        });
        gameNames.push(_gameName);
    }

    /**
     * @dev Removes a game.
     * @param _name the name of the game to be removed.
     */
    //TEST:
    function removeGameInternal(bytes32 _name) internal onlyRole(ROLE_MANAGER) {
        //TODO
        require(nameGame[_name].isPresent);

        uint gameToDelete = nameGame[_name].listPointer;
        bytes32 gameToMove = gameNames[gameNames.length.sub(1)];

        //https://ethereum.stackexchange.com/a/13168/39566
        //replace deleted game
        gameNames[gameToDelete] = gameToMove;
        nameGame[gameToMove].listPointer = gameToDelete;

        gameNames.length = gameNames.length.sub(1);
        delete nameGame[_name];
    }

    /**
     * @return all games.
     */
    //TEST:
    function getGamesInternal() internal view returns (bytes32[]) {
        return gameNames;
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev sets the casino.
     * @param _casinoAddress the casino address.
     */
    function setCasino(address _casinoAddress) external onlyRole(ROLE_MANAGER) {
        require(_casinoAddress != address(0));

        casino = Casino(_casinoAddress);
    }
}
