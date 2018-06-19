pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title SinglePlayerRandomness
 * @author
 * @dev The source of randomness using future block hashes. Phases are handled in a separate contract.
 */
contract SinglePlayerRandomness {
    using SafeMath for uint;

    /*
     * Events.
     */

    /**
     * @dev Emitted when a customer made guess.
     * @param _customer     the customer.
     * @param _guess        the guess.
     * @param _currentBlock the current block (committed).
     * @param _targetBlock  the target block (revealed).
     */
    event GuessMade(address _customer, uint _guess, uint _currentBlock, uint _targetBlock);

    /**
     * @dev Emitted when a customer guess a random number correctly.
     * @param _customer         the customer who guessed right.
     * @param _possibilities    the number of possiblities.
     */
    event GuessedRight(address _customer, uint _possibilities);

    /**
     * @dev Emitted when a new random number was generated.
     * @param _number           the number.
     * @param _possibilities    the number of possibilities.
     */
    event NewRandomNumber(uint _number, uint _possibilities);


    /*
     * Fields.
     */
    /** @dev The block in the future, from which hash is returned. */
    mapping(address => uint) internal playerTargetBlock;

    /** @dev The player's guess. */
    mapping(address => uint) internal playerGuess;


    constructor() internal {}


    /*
     * Business functions.
     */

    /**
     * @dev Sets the guess and the target block for the (player) external account.
     * @dev Uses tx.origin.
     * @param _guess the guess.
     * @param _targetBlock the target block.
     */
    //TEST:
    function setTarget(uint _guess, uint _targetBlock) internal {
        require(block.number < _targetBlock);

        playerTargetBlock[tx.origin] = _targetBlock;
        playerGuess[tx.origin] = _guess;

        emit GuessMade(tx.origin, _guess, block.number, _targetBlock);
    }

    /**
     * @dev The random number is
     * @param _max the number of possible outcomes e [0,_max).
     * @return A random number.
     */
    //TEST:
    function getRandomNumber(uint _max) internal returns (uint randomNumber) {
        uint targetBlock = playerTargetBlock[tx.origin];

        require(block.number >= targetBlock);

        randomNumber = uint(blockhash(targetBlock)) % _max;

        delete targetBlock;

        emit NewRandomNumber(randomNumber, _max);
    }

    /**
     * @dev Returns true if the guess was correct, otherwise false.
     * @dev Uses expects tx.origin to be the player.
     */
    //TEST:
    function guessedRight(uint _possibilities) internal returns (bool hasGuessedRight) {

        hasGuessedRight = uint(playerGuess[tx.origin]) == getRandomNumber(_possibilities);

        emit GuessedRight(tx.origin, _possibilities);
    }
}
