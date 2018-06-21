pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Casino.sol";
import "./game/Game.sol";

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

    /**
     * @dev Emitted when the casino changed.
     * @param _newCasino    the new casino.
     */
    event CasinoChanged(address _newCasino);

    /**
     * @dev Emitted when a game was added.
     * @param _newGame  the new game.
     * @param _gameName the game's name.
     * @param _gameType the game's type.
     */
    event GameAdded(address _newGame, bytes32 _gameName, bytes8 _gameType);

    /**
     * @dev Emitted when a game was removed.
     * @param _game  the game.
     */
    event GameRemoved(address _game);


    /*
     * Fields.
     */

    string internal constant ROLE_OWNER = "owner";
    string internal constant ROLE_MANAGER = "manager";

    /**
     * @title Game
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


    string public name;

    address public owner;
    address public manager;

    Casino public casino;

    /** @dev Mapping of game name to game info. For extensions of  */
    mapping (bytes32 => GameInfo) nameGameInfo;
    /** @dev List of game names. */
    bytes32[] gameNames;


    //TEST:
    constructor(string _name) internal {

        owner = msg.sender;

        name = _name;

        addRole(msg.sender, ROLE_OWNER);
        addRole(msg.sender, ROLE_MANAGER);
    }


    /*
     * Modifiers.
     */

    /** @dev requires the casino to be set. */
    //TEST:
    modifier hasCasino() {
        require(address(casino) != address(0));
        _;
    }

    /** @dev requires the token to be set. */
    //TEST:
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
     * @param _gameName the name of the game. NOTE: name must be unique!
     * @param _gameAddress the address of the game.
     */
    //TEST:
    function addGame(bytes32 _gameName, address _gameAddress) external hasCasino onlyRole(ROLE_MANAGER) {
        require(!nameGameInfo[_gameName].isPresent);

        Game game = Game(_gameAddress);

        game.setName(_gameName);

        nameGameInfo[_gameName] = GameInfo({
            listPointer: gameNames.length,
            gameName: _gameName,
            gameType: game.gameType(),
            gameAddress: _gameAddress,
            isPresent: true
        });
        gameNames.push(_gameName);

        emit GameAdded(_gameAddress, _gameName, game.gameType());
    }

    /**
     * @dev Removes a game.
     * @param _name the name of the game to be removed.
     */
    //TEST:
    function removeGame(bytes32 _name) external onlyRole(ROLE_MANAGER) {
        require(nameGameInfo[_name].isPresent);

        uint gameToDeleteListPointer = nameGameInfo[_name].listPointer;
        address gameToDeleteAddress = nameGameInfo[_name].gameAddress;
        bytes32 gameToMoveName = gameNames[gameNames.length.sub(1)];

        //https://ethereum.stackexchange.com/a/13168/39566
        //replace deleted game
        gameNames[gameToDeleteListPointer] = gameToMoveName;
        nameGameInfo[gameToMoveName].listPointer = gameToDeleteListPointer;

        gameNames.length = gameNames.length.sub(1);
        delete nameGameInfo[_name];

        emit GameRemoved(gameToDeleteAddress);
    }

    /**
     * @return all games.
     */
    //TEST:
    function getGames() external view returns (bytes32[]) {
        return gameNames;
    }

    /**
     * @dev unpacks the game's address.
     * @param _gameName The game's name, i.e. the key of the games mapping.
     * @return the address of the game.
     */
    //TEST:
    function getGameAddress(bytes32 _gameName) external view returns (address) {
        return nameGameInfo[_gameName].gameAddress;
    }

    /**
     * @dev unpacks the game's type.
     * @param _gameName The game's name, i.e. the key of the games mapping.
     * @return the type of the game.
     */
    //TEST:
    function getGameType(bytes32 _gameName) external view returns (bytes8) {
        return nameGameInfo[_gameName].gameType;
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev sets an operating manager.
     * @param _manager the manager's address.
     */
    //TEST:
    function setManager(address _manager) external onlyRole(ROLE_OWNER) {
        require(_manager != address(0));

        //remove old
        removeRole(manager, ROLE_MANAGER);

        manager = _manager;

        //add new
        addRole(manager, ROLE_MANAGER);
    }

    /**
     * @dev sets the casino.
     * @param _casinoAddress the casino address.
     */
    //TEST:
    function setCasino(address _casinoAddress) external onlyRole(ROLE_MANAGER) {
        require(_casinoAddress != address(0));

        casino = Casino(_casinoAddress);

        emit CasinoChanged(_casinoAddress);
    }
}
