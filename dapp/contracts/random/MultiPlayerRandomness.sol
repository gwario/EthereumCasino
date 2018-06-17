pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../timing/HasPhases.sol";

/**
 * @title MultiPlayerRandomness
 * @author
 * @dev The source of randomness using commit-reveal. Phases are handled in a separate contract
 */
contract MultiPlayerRandomness {
    using SafeMath for uint;

    /*
     * Fields.
     */

    address[] internal participants;

    mapping(address => bytes32) internal hashes;
    mapping(address => uint) internal seeds;


    constructor() internal {}


    /*
     * Business functions.
     */

    function commit(bytes32 hash) internal {
        hashes[msg.sender] = hash;
    }

    function reveal(uint value, uint seed) internal {
        require(hashes[msg.sender] == keccak256(abi.encodePacked(value, seed)));

        seeds[msg.sender] = seed;

        //TODO do something with the value...
    }

    function getRandomNumber(uint _max) internal returns(uint){
        //TODO require all participants revealed

        uint rand = 0;

        for (uint i = 0; i < participants.length; i++)
            rand = uint(keccak256(seeds[participants[i]], rand));

        return rand % _max;
    }
}
