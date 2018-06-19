pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "./token/ERC223Receiver.sol";
import "./GamblingHall.sol";
import "./token/CasinoToken.sol";

/**
 * @title Casino
 * @author mariogastegger
 * @dev The casino.
 */
contract Casino is RBAC, ERC223Receiver {
    using SafeMath for uint;

    /*
     * Events.
     */

    /**
     * @dev Emitted when the casino receives tokens.
     * @param _sender   the sender.
     * @param _origin   the customer.
     * @param _value    the value.
     * @param _data     the data.
     */
    event PaymentReceived(address _sender, address _origin, uint _value, bytes _data);

    /**
     * @dev Emitted when the owner transfers ether from the casino.
     * @param _owner    the owner.
     * @param _value    the value.
     */
    event OwnerPaidOut(address _owner, uint _value);

    /**
     * @dev Emitted when a customer transfers ether from the casino, i.e. he sells tokens.
     * @param _customer the customer.
     * @param _value    the value.
     */
    event CustomerPaidOut(address _customer, uint _value);

    /**
     * @dev Emitted when a customer transfers ether to the casino, i.e. he buys tokens.
     * @param _customer the customer.
     * @param _tokens   the number of tokens.
     */
    event CustomerBoughtIn(address _customer, uint _tokens);

    /**
     * @dev Emitted when a customer claims his prize from the casino.
     * @param _customer the customer.
     * @param _value    the value.
     * @param _game     the name of the game.
     */
    event CustomerClaimed(address _customer, uint _value, bytes32 _game);

    /**
     * @dev Emitted when the casino opens.
     */
    event Opened();

    /**
     * @dev Emitted when casino closes.
     */
    event Closed();

    /**
     * @dev Emitted when the casino's ether balance changed.
     * @param _newBalance   the new balance.
     */
    event EtherBalanceChanged(uint _newBalance);

    /**
     * @dev Emitted when the casino's token balance changed.
     * @param _newTokenBalance  the new balance.
     */
    event TokenBalanceChanged(uint _newTokenBalance);

    /**
     * @dev Emitted when the casino's exchange fee changed.
     * @param _newExchangeFee   the new exchange fee.
     */
    event ExchangeFeeChanged(uint _newExchangeFee);

    /**
     * @dev Emitted when the casino's gambling hall changed.
     * @param _newGamblingHall  the new gambling hall.
     */
    event GamblingHallChanged(address _newGamblingHall);

    /**
     * @dev Emitted when the casino's token changed.
     * @param _newToken  the new token.
     */
    event TokenChanged(address _newToken);

    /**
     * @dev Emitted when the casino's token price changed.
     * @param _newTokenPrice    the new token price.
     */
    event TokenPriceChangedChanged(uint _newTokenPrice);


    /*
     * Fields.
     */

    /** @dev the owner and beneficiary of the casino */
    string internal constant ROLE_OWNER = "owner";
    /** @dev the operating account */
    string internal constant ROLE_MANAGER = "manager";

    /** @dev the name of the casino. */
    string public name;

    /** @dev the owner of the casino. */
    address public owner;

    CasinoToken public token;
    GamblingHall public gamblingHall;

    /** @dev Whether the casino is open or not. */
    bool public opened;


    uint public tokenPrice;
    /** @dev fee which has to be paid for every token/ether exchange. */
    uint public exchangeFee;

    /**
     * @param _tokenAddress the address of the initial token.
     * @param _gamingHallAddress the address of the initial gaming hall.
     * @param _tokenPrice the initial token price.
     * @param _exchangeFee the initial fee for exchanging ether/tokens.
     */
    //TEST:
    constructor(address _tokenAddress, address _gamingHallAddress, uint _tokenPrice, uint _exchangeFee) internal {
        require(_tokenAddress != address(0));
        require(_gamingHallAddress != address(0));
        require(_tokenPrice > 0);

        token = CasinoToken(_tokenAddress);
        gamblingHall = GamblingHall(_gamingHallAddress);

        owner = msg.sender;
        opened = false;
        tokenPrice = _tokenPrice;
        exchangeFee = _exchangeFee;

        addRole(owner, ROLE_OWNER);
        addRole(owner, ROLE_MANAGER);
    }

    /*
     * Modifiers.
     */

    /** @dev Requires the casino to be opened. */
    //TEST:
    modifier isOpened() {
        require(opened);
        _;
    }

    /** @dev Requires the casino to be closed. */
    //TEST:
    modifier isClosed() {
        require(!opened);
        _;
    }

    /** @dev Requires the casino to have a token. */
    //TEST:
    modifier hasToken() {
        require(address(token) != address(0));
        _;
    }

    /**
     * @dev checks if the sender is a game contract of the gambling hall.
     * @param _gameName Name of the game, in order to quickly verify the sender.
     */
    //TEST:
    modifier senderIsGame(bytes32 _gameName) {
        require(address(gamblingHall) != address(0));

        require(msg.sender == gamblingHall.getGameAddress(_gameName));

        _;
    }


    /*
     * Business function.
     */

    /**
     * @dev Opens the casino.
     */
    //TEST:
    function open() external isClosed hasToken onlyRole(ROLE_MANAGER) {
        opened = true;

        emit Opened();
    }

    /**
     * @dev Closes the casino.
     */
    //TEST:
    function close() external isOpened onlyRole(ROLE_MANAGER) {
        opened = false;

        emit Closed();
    }

    /**
     * @dev Transfers tokens to the customer.
     * @param _customer the receiver of the tokens.
     */
    //TEST:
    function buyInternal(address _customer) internal isOpened returns (bool success) {
        require(0 < msg.value);
        require(_customer != address(0));

        uint paidFee = msg.value % tokenPrice;

        require(paidFee == exchangeFee);

        uint customerTokens = msg.value.div(tokenPrice);

        require(customerTokens < token.balanceOf(address(this)));

        //transfer from the casino contract to the customer
        success = token.transfer(_customer, customerTokens);

        emit CustomerBoughtIn(_customer, customerTokens);
        emit EtherBalanceChanged(address(this).balance);
    }

    /**
     * @dev Returns ether minus the fee, for the customer tokens
     * @param _customer the buyer of the tokens.
     */
    //TEST:
    function cashoutInternal(address _customer) internal isOpened returns (bool success) {
        require(_customer != address(0));

        uint customerTokenBalance = token.balanceOf(_customer);
        uint customerEtherBalance = customerTokenBalance.mul(tokenPrice);

        //check balance of the casino
        require(customerEtherBalance < address(this).balance);

        //transfer from the casino to the customer and minus fee
        _customer.transfer(customerEtherBalance.sub(exchangeFee));

        emit CustomerPaidOut(_customer, customerTokenBalance);
        emit EtherBalanceChanged(address(this).balance);

        success = true;
    }


    /**
     * @dev Payout to beneficiary.
     */
    //TEST:
    function payout() external isClosed onlyRole(ROLE_OWNER) {
        //TODO check if enough money remains to payout all customers.

        uint balance = address(this).balance;

        //transfer to the owner ETHER
        msg.sender.transfer(balance);

        emit OwnerPaidOut(msg.sender, balance);
        emit EtherBalanceChanged(address(this).balance);
    }

    /** @dev has to be implemented by a casino to receive price... */
    function tokenFallback(address _sender, address _origin, uint256 _value, bytes _data) public returns (bool success) {

        if(keccak256(_data) == keccak256("production")) {

            //ensure winnings can be cashed out.
            require(token.balanceOf(address(this)).mul(tokenPrice) <= address(this).balance);

            emit TokenBalanceChanged(token.balanceOf(address(this)));

        } else {
            //no need to handle things... tokens go out from the casino and go back to it.
            //TODO maybe burn the received tokens in the future?!?!

            emit PaymentReceived(_sender, _origin, _value, _data);
        }

        success = true;
    }

    /**
     * @dev To stock up ether. Send ether to the casino before producing more tokens.
     */
    //TEST:
    function() external payable {
        emit EtherBalanceChanged(address(this).balance);
    }

    /**
     * @dev Pays the win to the winner.
     * @param _customer the winner.
     * @param _prize the prize.
     * @param _gameName the name of the game for quick sender verification.
     */
    //TEST:
    function payOutWin(address _customer, uint _prize, bytes32 _gameName) external senderIsGame(_gameName) returns (bool success) {

        success = token.transfer(_customer, _prize, bytes32ToBytes(_gameName));

        emit CustomerClaimed(_customer, _prize, _gameName);
    }

    function bytes32ToBytes(bytes32 data) internal pure returns (bytes) {
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

    /*
     * Maintenance functions.
     */

    /**
     * @dev adds an operating manager.
     * @param _manager the manager's address.
     */
    //TEST:
    function addManager(address _manager) external onlyRole(ROLE_OWNER) {
        require(_manager != address(0));

        addRole(_manager, ROLE_MANAGER);
    }

    /**
     * @dev removes an operating manager.
     * @param _manager the manager's address.
     */
    //TEST:
    function removeManager(address _manager) external onlyRole(ROLE_OWNER) {
        removeRole(_manager, ROLE_MANAGER);
    }

    /**
     * @dev Sets a new token.
     * @param _tokenAddress the address of a token.
     */
    //TEST:
    function setToken(address _tokenAddress) external isClosed onlyRole(ROLE_MANAGER) {
        require(_tokenAddress != address(0));

        token = CasinoToken(_tokenAddress);

        emit TokenChanged(_tokenAddress);
        emit TokenBalanceChanged(token.balanceOf(address(this)));
    }

    /**
     * @dev Sets a token price.
     * @param _tokenPrice the token price.
     */
    //TEST:
    function setTokenPrice(uint _tokenPrice) external isClosed onlyRole(ROLE_MANAGER) {
        require(_tokenPrice > 0);

        tokenPrice = _tokenPrice;

        emit TokenPriceChangedChanged(tokenPrice);
    }

    /**
     * @dev Sets a new gaming hall.
     * @param _gamblingHallAddress the address of a gaming hall.
     */
    //TEST:
    function setGamingHall(address _gamblingHallAddress) external isClosed onlyRole(ROLE_MANAGER) {
        require(_gamblingHallAddress != address(0));

        gamblingHall = GamblingHall(_gamblingHallAddress);

        emit GamblingHallChanged(_gamblingHallAddress);
    }

    /**
     * @dev Sets a token price.
     * @param _exchangeFee the token price.
     */
    //TEST:
    function setExchangeFee(uint _exchangeFee) external isClosed onlyRole(ROLE_MANAGER) {
        exchangeFee = _exchangeFee;

        emit ExchangeFeeChanged(exchangeFee);
    }
}
