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
     * @param _guess the guess.
     * @param _targetBlock the target block.
     */
    //TEST:
    function setTarget(uint _guess, uint _targetBlock) internal {
        require(block.number < _targetBlock);

        playerTargetBlock[tx.origin] = _targetBlock;
        playerGuess[tx.origin] = _guess;
    }

    /**
     * @dev The random number is
     * @param _max the number of possible outcomes e [0,_max).
     * @return A random number.
     */
    //TEST:
    function getRandomNumber(uint _max) internal view returns (uint) {
        uint targetBlock = playerTargetBlock[tx.origin];

        require(block.number >= targetBlock);

        uint randomNumber = uint(blockhash(targetBlock)) % _max;

        delete targetBlock;

        return randomNumber;
    }

    /**
     * @dev Returns true if the guess was correct, otherwise false.
     */
    function guessedRight(uint _possibilities) internal returns (bool) {
        return uint(playerGuess[tx.origin]) == getRandomNumber(_possibilities);
    }
}
