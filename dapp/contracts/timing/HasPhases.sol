pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title HasPhases
 * @author mariogastegger
 * @dev Timing for the phases of a game.
 * @dev Before the commit phase, participants start the game.
 * @dev The commit duration marks the duration in which participants can choose their move.
 * @dev The reveal duration marks the duration in which participants can reveal their move.
 * @dev The claim duration marks the duration in which participants can claim their prize.
 * @dev After the claim phase, a manager can end the game and claim all unclaimed prizes.
 */
contract HasPhases {
    using SafeMath for uint256;


    /** @dev Duration[s]= duration[block] * 15[s/block] = 40 * 15 = 600s = 10min */
    uint8 public constant durationCommitMax = 40;
    /** @dev Duration[s]= duration[block] * 15[s/block] = 3 * 15 = 45s */
    uint8 public constant durationCommitMin = 3;

    /** @dev Duration[s]= duration[block] * 15[s/block] = 20 * 15 = 300s = 5min */
    uint8 public constant durationRevealMax = 20;
    /** @dev Duration[s]= duration[block] * 15[s/block] = 3 * 15 = 45s */
    uint8 public constant durationRevealMin = 3;

    //TODO might not be necessary?!?!
    /** @dev Duration[s]= duration[block] * 15[s/block] = 20 * 15 = 300s = 5min */
    uint8 public constant durationClaimMax = 20;
    /** @dev Duration[s]= duration[block] * 15[s/block] = 15 * 15 = 60s = 3min */
    uint8 public constant durationClaimMin = 15;


    struct Phase {
        uint256 blockCommit;
        uint256 blockReveal;
        uint256 blockClaim;

        uint8 durationCommit;
        uint8 durationReveal;
        uint8 durationClaim;
    }

    Phase internal gamePhase;

    /*
     * Events.
     */

    /**
     * @dev Start of the commit phase.
     * @dev A player can enter the game during this phase.
     * @param game The game.
     * @param blockCommit The block number when commit phase started.
     * @param durationCommit How long it is possible to commit.
     * @param blockReveal The block number when the reveal phase started.
     * @param durationReveal How long it is possible to reveal.
     * @param blockClaim The block number when the claim phase started.
     * @param durationClaim How long it is possible to reveal.
     */
    event CommitStarted(address game,
        uint256 blockCommit, uint8 durationCommit,
        uint256 blockReveal, uint8 durationReveal,
        uint256 blockClaim, uint8 durationClaim);

    /**
     * @dev Start of the reveal phase.
     * @dev A player can reveal his tip during this phase.
     * @dev If a player does not reveal, he looses his stake.
     * @param game The game.
     * @param blockReveal The block number when the reveal phase started.
     * @param durationReveal How long it is possible to reveal.
     * @param blockClaim The block number when the claim phase started.
     * @param durationClaim How long it is possible to reveal.
     */
    event RevealStarted(address game,
        uint256 blockReveal, uint8 durationReveal,
        uint256 blockClaim, uint8 durationClaim);

    /**
     * @dev Start of the claim phase.
     * @dev A player has to claim his prize during this phase.
     * @dev If a player does not claim his prize, the bank keeps it.
     * @param game The game.
     * @param blockClaim The block number when the claim phase started.
     * @param durationClaim How long it is possible to reveal.
     */
    event ClaimStarted(address game,
        uint256 blockClaim, uint8 durationClaim);

    /**
     * @dev End of the claim phase.
     * @dev If a player has not claimed his prizce until now, the bank keeps it.
     * @param game The game.
     */
    event ClaimEnd(address game);


    /*
     * Modifiers.
     */

    /**
     * @dev Requires the durations to be within the defined limits.
     * @param _durationCommit The duration of the commit phase as number of blocks.
     * @param _durationReveal The duration of the reveal phase as number of blocks.
     * @param _durationClaim The duration of the claim phase as number of blocks.
     */
    //TEST:
    modifier validDurations(uint8 _durationCommit, uint8 _durationReveal, uint8 _durationClaim) {
        require(durationCommitMin <= _durationCommit);
        require(_durationCommit <= durationCommitMax);

        require(durationRevealMin <= _durationReveal);
        require(_durationReveal <= durationRevealMax);

        require(durationClaimMin <= _durationClaim);
        require(_durationClaim <= durationClaimMax);
        _;
    }

    /**
     * @dev Requires the phase to be in its initial state/non-existent.
     */
    //TEST:
    modifier canStart() {
        require(gamePhase.blockCommit == 0);
        require(gamePhase.blockReveal == 0);
        require(gamePhase.blockClaim == 0);
        require(gamePhase.durationCommit == 0);
        require(gamePhase.durationReveal == 0);
        require(gamePhase.durationClaim == 0);
        _;
    }

    /**
     * @dev Requires to be in the commit phase.
     */
    //TEST:
    modifier canCommit() {
        require(inPhaseCommit());
        _;
    }

    /**
     * @dev Requires to be in the reveal phase.
     */
    //TEST:
    modifier canReveal() {
        require(inPhaseReveal());
        _;
    }

    /**
     * @dev Requires to be in the claim phase.
     */
    //TEST:
    modifier canClaim() {
        require(inPhaseClaim());
        _;
    }

    /**
     * @dev Requires the claim phase to be over.
     */
    //TEST:
    modifier canEnd() {
        require(gamePhase.blockCommit != 0);
        require(gamePhase.blockReveal != 0);
        require(gamePhase.blockClaim != 0);
        require(gamePhase.blockClaim.add(gamePhase.durationClaim) < block.number);
        _;
    }

    /**
     * @dev Requires the claim phase to be over.
     */
    //TEST:
    modifier canCancel() {
        require(gamePhase.blockCommit != 0);
        require(gamePhase.blockClaim.add(gamePhase.durationClaim) < block.number);
        _;
    }


    /*
     * Business logic.
     */

    /**
     * @dev Starts the game by specifying the duration.
     * @param _durationCommit The duration of the commit phase as number of blocks.
     * @param _durationReveal The duration of the reveal phase as number of blocks.
     * @param _durationClaim The duration of the claim phase as number of blocks.
     * @return true on success, otherwise false.
     */
    //TEST:
    function startCommit(uint8 _durationCommit, uint8 _durationReveal, uint8 _durationClaim) internal
    canStart validDurations(_durationCommit, _durationReveal, _durationClaim) returns (bool) {
        gamePhase = Phase({
            blockCommit: block.number,
            blockReveal: 0,
            blockClaim: 0,
            durationCommit: _durationCommit,
            durationReveal: _durationReveal,
            durationClaim: _durationClaim
        });
        return true;
    }

    /**
     * @dev Starts the reveal phase.
     * @return true on success, otherwise false.
     */
    //TEST:
    function startReveal() internal canReveal returns (bool) {
        gamePhase.blockReveal = block.number;
        return true;
    }

    /**
     * @dev Starts the reveal phase.
     * @return true on success, otherwise false.
     */
    //TEST:
    function startClaim() internal canClaim returns (bool) {
        gamePhase.blockReveal = block.number;
        return true;
    }

    /**
     * @dev Ends the reveal phase. Resets the game.
     * @return true on success, otherwise false.
     */
    //TEST:
    function endClaim() internal canEnd returns (bool) {
        delete gamePhase;
        return true;
    }

    /**
     * @return true if in the commit phase.
     */
    //TEST:
    function inPhaseCommit() internal returns (bool) {
        if(gamePhase.blockCommit != 0
        && gamePhase.blockReveal == 0
        && gamePhase.blockClaim == 0
        && block.number <= gamePhase.blockCommit.add(gamePhase.durationCommit)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @return true if in the reveal phase.
     */
    //TEST:
    function inPhaseReveal() internal returns (bool) {
        if(gamePhase.blockCommit != 0
        && gamePhase.blockReveal != 0
        && gamePhase.blockClaim == 0
        && block.number <= gamePhase.blockReveal.add(gamePhase.durationReveal)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @return true if in the claim phase.
     */
    //TEST:
    function inPhaseClaim() internal returns (bool) {
        if(gamePhase.blockCommit != 0
        && gamePhase.blockReveal != 0
        && gamePhase.blockClaim != 0
        && block.number <= gamePhase.blockClaim.add(gamePhase.durationClaim)) {
            return true;
        } else {
            return false;
        }
    }
}
