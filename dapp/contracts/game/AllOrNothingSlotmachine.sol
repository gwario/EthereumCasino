pragma solidity ^0.4.23;

import "../random/SinglePlayerRandomness.sol";
import "./Game.sol";
import "../token/ERC223Receiver.sol";
import "../ByteUtils.sol";

/**
 * @title AllOrNothingSlotmachine
 * @author mariogastegger
 * @dev A slot machine where the chance of winning depends on the players address and a random number.
 */
contract AllOrNothingSlotmachine is Game, SinglePlayerRandomness, ERC223Receiver {
    using ByteUtils for bytes32;

    /*
     * Events.
     */

    /**
     * @dev Emitted when the slotmachine is interacted with.
     * @param _customer     the customer who is interacting.
     * @param _interaction  the kind of interaction.
     */
    event Interaction(address _customer, bytes _interaction);


    /*
     * Fields.
     */

    /** @dev the tpye and version of this contract. */
    bytes8 public constant TYPE_VERSION = "sm_1.0";

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
    uint8 public targetBlockOffset;


    constructor(
        uint _prize, uint _price, uint _deposit, uint _possibilities,
        address _gamblingHallAddress, uint8 _targetBlockOffset
    ) Game(TYPE_VERSION, _gamblingHallAddress) SinglePlayerRandomness() public {
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
     * Handles the customer actions along with the transfer.
     */
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success) {
        require(msg.sender == address(gamblingHall.casino().token()));
        //the only allowed caller is the token contract.

        if(keccak256(_data) == keccak256(DATA_PULL_THE_LEVER)) {

            pullTheLever(_origin, _value);

        } else if(keccak256(_data) == keccak256(DATA_CLAIM)) {

            require(_value == 0);

            claim(_origin);
        }

        success = true;

        emit Interaction(_origin, _data);
    }


    /**
     * @dev String to be used in data of a ERC233 transfer to pull the lever of the slot machine.
     */
    bytes constant public DATA_PULL_THE_LEVER = "pullTheLever";

    /**
     * @dev Makes a guess for the Pulls the lever of the slot machine.
     * @param _customer The customer, i.e. the gambler.
     * @param _value the amount of tokens sent by the customer.
     */
    function pullTheLever(address _customer, uint _value) internal isAvailable {
        require(_value == price.add(deposit));

        uint guess = uint(_customer) % possibilities;

        setTarget(guess, block.number.add(targetBlockOffset));

        //transfer price to the casino
        assert(gamblingHall.casino().token().transfer(
                address(gamblingHall.casino()), //to
                price,                          //value
                name.toBytes())                 //the game's name
        );

        emit Played(_customer);
    }



    /**
     * @dev String to be used in data of a ERC233 transfer to claim the prize of the slot machine.
     */
    bytes constant public DATA_CLAIM = "claim";

    /**
     * @dev If the guess was correct, transfers the prize and the deposit to the customer.
     * @dev If the guess was wrong, transfers the price to the casino and returns the deposit.
     * @param _customer The customer, i.e. the gambler.
     */
    function claim(address _customer) internal isAvailable {
        //TODO make shure it is not done in this block... this should be the case anyway since offset > 0

        //throws already
        bool guessCorrect = guessedRight(possibilities);

        if(guessCorrect) {

            //assume casino has enough tokens
            //requests the casino to payout the prize
            assert(gamblingHall.casino().payOutWin(_customer, prize, name));

            emit CustomerWon(_customer, prize);

        } else {

            emit CustomerLost(_customer);
        }

        //pays back the deposit
        assert(gamblingHall.casino().token().transfer(
                _customer,  //to
                deposit)    //value
        );

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

        emit ParameterChanged("price", price);
        emit ParameterChanged("prize", prize);
    }

    /**
     * @dev Sets the security deposit.
     * @param _deposit the deposit.
     */
    function setDeposit(uint _deposit) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(DEPOSIT_MIN <= _deposit);

        deposit = _deposit;

        emit ParameterChanged("deposit", deposit);
    }

    /**
     * @dev Sets the possibilities.
     * @param _possibilities the possibilities.
     */
    function setPossibilities(uint _possibilities) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(POSSIBILITIES_MIN <= _possibilities);

        possibilities = _possibilities;

        emit ParameterChanged("possibilities", possibilities);
    }

    /**
     * @dev Sets the target block offset.
     */
    function setTargetBlockOffset(uint8 _targetBlockOffset) external onlyRole(ROLE_SUPERVISER) isNotAvailable {
        require(TARGET_BLOCK_OFFSET_MIN <= _targetBlockOffset);
        require(_targetBlockOffset <= TARGET_BLOCK_OFFSET_MAX);

        targetBlockOffset = _targetBlockOffset;

        emit ParameterChanged("targetBlockOffset", targetBlockOffset);
    }
}
