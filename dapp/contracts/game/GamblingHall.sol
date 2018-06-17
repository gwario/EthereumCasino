pragma solidity ^0.4.23;
import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title HasGames
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
    string internal constant ROLE_ADMIN = "admin";

    bytes8 internal constant GAME_TYPE_SLOTMACHINE = "slotV1.0";

    /** @dev Mapping of game name to game info. */
    mapping (bytes32 => GameInfo) nameGame;
    /** @dev List of game names. */
    bytes32[] gameNames;


    address internal casinoAddress;

    /**
     * @title GameInfo
     * @dev Holds information about a game.
     */
    struct GameInfo {
        uint256 listPointer;
        address gameAddress;
        bytes32 gameName;
        bytes8 gameType;
        bool isPresent;
    }

    constructor(address _admin) {
        require(_admin != address(0));

        addRole(_admin, ROLE_ADMIN);
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
    function addGame(bytes32 _gameName, bytes8 _gameType, address _gameAddress) external onlyRole(ROLE_ADMIN) {
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
    function removeGame(bytes32 _name) external onlyRole(ROLE_ADMIN) {
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
    function getGames() external view returns (bytes32[]) {
        return gameNames;
    }
}
