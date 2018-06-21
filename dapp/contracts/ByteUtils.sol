pragma solidity ^0.4.23;

/**
 * @title ByteUtils
 * @author mariogastegger
 * @dev Conversions from / to byte types.
 */
library ByteUtils {

    /*
     * Business functions.
     */

    /**
     * @dev Converts bytes32 to bytes.
     * @param data thy byte32 data.
     * @return data as bytes.
     */
    function toBytes(bytes32 data) internal pure returns (bytes) {
        uint i = 0;
        while (i < 32 && uint(data[i]) != 0) {
            ++i;
        }
        bytes memory result = new bytes(i);
        i = 0;
        while (i < 32 && data[i] != 0) {
            result[i] = data[i];
            ++i;
        }
        return result;
    }
}