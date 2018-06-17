pragma solidity ^0.4.23;

import "../random/SinglePlayerRandomness.sol";
import "./Game.sol";

/**
 * @title AllOrNothingSlotmachine
 * @author mariogastegger
 * @dev A slot machine where the chance of winning depends on the players address and a random number.
 */
contract AllOrNothingSlotmachine is Game, SinglePlayerRandomness {

    /*
     * Fields.
     */

    /** @dev Duration[s]= duration[block] * 15[s/block] = 20 * 15 = 300s = 5min */
    uint8 internal constant TARGET_BLOCK_OFFSET_MAX = 20;
    /** @dev Duration[s]= duration[block] * 15[s/block] = 3 * 15 = 45s */
    uint8 internal constant TARGET_BLOCK_OFFSET_MIN = 3;

    uint internal constant PRICE_MIN = 1;
    uint internal constant PRIZE_MIN = 2;
    uint internal constant DEPOSIT_MIN = 0;
    uint internal constant POSSIBILITIES_MIN = 10;


    /** @dev the prize for winning. */
    uint public prize;

    /** @dev the price for playing. */
    uint public price;
    /** @dev the security deposit for playing. */
    uint public deposit;

    /** @dev results in a 1-in-possibilities chance */
    uint public possibilities;

    /** @dev Target block offset to block.number. Lower numbers increase performance. */
    uint8 internal targetBlockOffset;


    constructor(
        uint _prize, uint _price, uint _deposit, uint _possibilities,
        address _gamblingHallAddress, uint8 _targetBlockOffset
    ) Game(_gamblingHallAddress) SinglePlayerRandomness() public {
        require(PRIZE_MIN <= _prize);
        require(_price < _prize);
        require(PRICE_MIN <= _price);
        require(DEPOSIT_MIN <= _deposit);
        require(POSSIBILITIES_MIN <= _possibilities);
        require(TARGET_BLOCK_OFFSET_MIN <= _targetBlockOffset);
        require(_targetBlockOffset <= TARGET_BLOCK_OFFSET_MAX);

        prize = _prize;
        price = _price;
        deposit = _deposit;
        possibilities = _possibilities;
        targetBlockOffset = _targetBlockOffset;
    }


    /*
     * Modifiers.
     */


    /*
     * Business functions.
     */

    /**
     * @dev Pulls the lever of the slot machine.
     * @dev Starts the commit phase.
     */
    function pullTheLever() external isAvailable {

        assert(gamblingHall.token().transfer(
                address(gamblingHall.casino()),
                price.add(deposit))
        );

        uint guess = uint(tx.origin) % possibilities;

        setTarget(guess, block.number.add(targetBlockOffset));
    }

    /**
     * @dev Claims the prize.
     * @dev Starts the claim phase.
     */
    function claim() external isAvailable {

        //throws already
        bool guessCorrect = guessedRight(possibilities);

        if(guessCorrect) {
            assert(gamblingHall.token().transfer(
                    address(gamblingHall.casino()),
                    price.add(deposit))
            );
        } else {
            //TODO return deposit
        }

        delete playerGuess[tx.origin];
        delete playerTargetBlock[tx.origin];
    }


    /*
     * Maintenance functions.
     */

    /**
     * @dev Sets a price and a prize.
     * @param _price the price.
     * @param _prize the prize.
     */
    function setPrice(uint _price, uint _prize) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(PRICE_MIN < _price);
        require(PRIZE_MIN < _prize);
        require(_price < _prize);

        price = _price;
        prize = _prize;
    }

    /**
     * @dev Sets the security deposit.
     * @param _deposit the deposit.
     */
    function setDeposit(uint _deposit) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(DEPOSIT_MIN <= _deposit);

        deposit = _deposit;
    }

    /**
     * @dev Sets the possibilities.
     * @param _possibilities the possibilities.
     */
    function setPossibilities(uint _possibilities) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(POSSIBILITIES_MIN <= _possibilities);

        possibilities = _possibilities;
    }

    /**
     * @dev Sets the target block offset.
     */
    function setTargetBlockOffset(uint8 _targetBlockOffset) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(TARGET_BLOCK_OFFSET_MIN <= _targetBlockOffset);
        require(_targetBlockOffset <= TARGET_BLOCK_OFFSET_MAX);

        targetBlockOffset = _targetBlockOffset;
    }
}
