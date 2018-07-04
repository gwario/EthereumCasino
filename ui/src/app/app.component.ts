import {Component, OnInit} from '@angular/core';
import {CasinoService} from "./service/casino.service";
import {Web3Service} from "./service/web3.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {CasinoTokenService} from "./service/casino-token.service";
import {GamblingHallService} from "./service/gambling-hall.service";
import {InviteComponent} from "./dialogs/invite/invite.component";
import {AccountService} from "./service/account.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private casinoName: string;
  private casinoAddress: string;
  private casinoTokenAddress: string;
  private gamblingHallAddress: string;

  constructor(private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private accountService: AccountService,
              private web3Service: Web3Service,
              private snackBar: MatSnackBar,
              public dialog: MatDialog) {

    this.casinoService.getName().then(value => {
      this.casinoName = value;
    });

    this.casinoAddress = casinoService.getAddress();
    this.casinoTokenAddress = casinoTokenService.getAddress();
    this.gamblingHallAddress = gamblingHallService.getAddress();
  }

  ngOnInit(): void {

    this.web3Service.events.subscribe(event => {
      console.log(event);

      if(event.origin === 'web3') {
        if(event.type === 'error') {
          console.error("error:", event.event);
        } else {
          console.log("event:", event.event);
          //TODO info msgs.... the ones which need further actions are handled in the respective places
          //TODO the ones with actions are handled in the account component in order to have the right from-address
          const CONTRACT = event.contract;
          const EVENT = event.event.event;
          let action = '';
          let message = null;
          switch (CONTRACT) {
            case "CasinoToken":
              message = AppComponent.getMessageForCasinoToken(EVENT, event.event);
              break;
            case "Casino":
              message = AppComponent.getMessageForCasino(EVENT, event.event);
              break;
            case "GamblingHall":
              message = AppComponent.getMessageForGamblingHall(EVENT, event.event);
              break;
            case "AllOrNothingSlotmachine":
              message = AppComponent.getMessageForAllOrNothingSlotmachine(EVENT, event.event);
              break;
            default:
              console.warn("Event from unhandled contract '"+CONTRACT+"'!");
          }

          if(message != null) {
            this.snackBar.open(message, action, {
              duration: 2000,
            });
          }
        }
      }
    });
  }


  openInviteDialog() {
    let dialogRef = this.dialog.open(InviteComponent);
    dialogRef.afterClosed().subscribe(address => {
      console.log(address);
      if(address) {
        console.debug("invite: ", address);
        this.accountService.add(address);
      } else {
        console.debug("invite: cancel");
      }
    });
  }


  /**
   * Handles slotmachine events:
   * // event Interaction(address _customer, bytes _interaction);
   * // event Played(address _customer);
   * // event CustomerWon(address _customer, uint _prize);
   * // event CustomerLost(address _customer);
   * // event Hold();
   * // event Released();
   * // event ParameterChanged(string _parameter, uint _newValue);
   * // event GuessMade(address _customer, uint _guess, uint _currentBlock, uint _targetBlock);
   * // event GuessedRight(address _customer, uint _possibilities);
   * // event NewRandomNumber(uint _number, uint _possibilities);
   * // event GamblingHallChanged(address _newGamblingHall);
   * @param {string} event_name
   * @param event
   * @returns {string} the message or null for silent events.
   */
  private static getMessageForAllOrNothingSlotmachine(event_name: string, event: any): string {

    const ARGS = event.returnValues;

    switch (event_name) {
      case "GamblingHallChanged":
        console.info("GamblingHallChanged", event.event);
        return null;
      case "Hold":
        return "AllOrNothingSlotmachine was put on hold!";
      case "Released":
        return "AllOrNothingSlotmachine was released!";
      case "ParameterChanged":
        return "AllOrNothingSlotmachine: "+ARGS._parameter+" changed to "+ARGS._newValue;
      case "GuessMade":
        console.log("GuessMade", "Customer: "+ARGS._customer, "Guess: "+ARGS._guess, "CurrentBlock:"+ARGS._currentBlock, "TargetBlock: "+ARGS._targetBlock);
        return null;
      case "GuessedRight":
        console.log("GuessedRight", "Customer: "+ARGS._customer, "Possibilities: "+ARGS._possibilities);
        return null;
      case "NewRandomNumber":
        console.log("NewRandomNumber", "Number: "+ARGS._number, "Possibilities: "+ARGS._possibilities);
        return null;
      case "Interaction":
        console.log("Interaction", "Customer: "+ARGS._customer, "Interaction: "+ARGS._interaction);
        return null;
      case "Played":
        return ""+ARGS._customer+" played the AllOrNothingSlotmachine!";
      case "CustomerWon":
        return ""+ARGS._customer+" has won "+ARGS._prize+" tokens at the AllOrNothingSlotmachine!";
      case "CustomerLost":
        return ""+ARGS._customer+" lost tokens at the AllOrNothingSlotmachine!";
      default:
        console.warn("Unhandled event '"+event_name+"' from contract 'AllOrNothingSlotmachine'! Args:"+ARGS);
        return null;
    }
  }

  /**
   * Handles gabling hall events:
   * // event CasinoChanged(address _newCasino);
   * // event GameAdded(address _newGame, bytes32 _gameName, bytes8 _gameType);
   * // event GameRemoved(address _game);
   * @param {string} event_name
   * @param event
   * @returns {string} the message or null for silent events.
   */
  private static getMessageForGamblingHall(event_name: string, event: any): string {

    const ARGS = event.returnValues;

    switch (event_name) {
      case "CasinoChanged":
        console.info("CasinoChanged", event.event);
        return null;
      case "GameAdded":
        return "The game (Type: "+ARGS._gameType+") "+ARGS._gameName+" ("+ARGS._newGame+") is now available!";
      case "GameRemoved":
        return "The game at "+ARGS._game+" is not available anymore!";
      default:
        console.warn("Unhandled event '"+event_name+"' from contract 'SimpleGamblingHall'!");
        return null;
    }
  }

  /**
   * Handles casino events:
   * // event RevenueReceived(address _sender, address _origin, uint _value);
   * // event OwnerPaidOut(address _owner, uint _value);
   * // event CustomerPaidOut(address _customer, uint _value);
   * // event CustomerBoughtIn(address _customer, uint _tokens);
   * // event CustomerClaimed(address _customer, uint _value, bytes32 _game);
   * // event Opened();
   * // event Closed();
   * // event EtherBalanceChanged(uint _newBalance);
   * // event TokenBalanceChanged(uint _newTokenBalance);
   * // event ExchangeFeeChanged(uint _newExchangeFee);
   * // event TokenPriceChanged(uint _newTokenPrice);
   * // event GamblingHallChanged(address _newGamblingHall);
   * // event TokenChanged(address _newToken);
   * @param {string} event_name
   * @param event
   * @returns {string} the message or null for silent events.
   */
  private static getMessageForCasino(event_name: string, event: any): string {

    const ARGS = event.returnValues;

    switch (event_name) {
      case "TokenChanged":
        console.info("TokenChanged", event.event);
        return null;
      case "GamblingHallChanged":
        console.info("GamblingHallChanged", event.event);
        return null;
      case "Closed":
        return "Casino was closed!";
      case "Opened":
        return "Casino was opened!";
      case "RevenueReceived":
        console.log("RevenueReceived", "Sender: "+ARGS._sender, "Origin: "+ARGS._origin, "Value: "+ARGS._value)
        return null;
      case "OwnerPaidOut":
        console.log("OwnerPaidOut", "Owner: "+ARGS._owner, "Value: "+ARGS._value);
        return null;
      case "CustomerPaidOut":
        console.log("CustomerPaidOut", "Customer: "+ARGS._customer, "Value: "+ARGS._value);
        return null;
      case "CustomerBoughtIn":
        console.log("CustomerPaidOut", "Customer: "+ARGS._customer, "Tokens: "+ARGS._tokens);
        return null;
      case "CustomerClaimed":
        console.log("CustomerClaimed", "Customer: "+ARGS._customer, "Value: "+ARGS._value, "Game: "+ARGS._game);
        return null;
      case "EtherBalanceChanged":
        console.log("EtherBalanceChanged", "New balance: "+ARGS._newBalance);
        return null;
      case "TokenBalanceChanged":
        console.log("TokenBalanceChanged", "New token balance: "+ARGS._newTokenBalance);
        return null;
      case "ExchangeFeeChanged":
        return "The token exchange fee changed to "+ARGS._newExchangeFee;
      case "TokenPriceChanged":
        return "The token price changed to "+ARGS._newTokenPrice;
      default:
        console.warn("Unhandled event '"+event_name+"' from contract 'NewVegas'!");
        return null;
    }
  }

  /**
   * Handles casino token events:
   * // event Transfer(address indexed from, address indexed to, uint256 value);
   * // event Transfer(address indexed _from, address indexed _to, uint256 _value, bytes indexed _data);
   * // event Mint(address indexed to, uint256 amount);
   * // event MintFinished();
   * // event Burn(address indexed burner, uint256 value);
   * // event ProductionFinished(address indexed _owner, uint256 _amount);
   * @param {string} event_name
   * @param event
   * @returns {string} the message or null for silent events.
   */
  private static getMessageForCasinoToken(event_name: string, event: any): string {

    const ARGS = event.returnValues;

    switch (event_name) {
      case "Transfer":
        if('_data' in event)
          console.log("Transfer", "From: "+ARGS._from, "To: "+ARGS._to, "Value: "+ARGS._value, "Date: "+ARGS._data);
        else
          console.log("Transfer", "From: "+ARGS.from, "To: "+ARGS.to, "Value: "+ARGS.value);
        return null;
      case "Mint":
        console.log("Mint", "To: "+ARGS.to, "Amount: "+ARGS.amount);
        return null;
      case "MintFinished":
        console.log("MintFinished");
        return null;
      case "Burn":
        console.log("Burn", "Burner: "+ARGS.burner, "Value: "+ARGS.value);
        return null;
      case "ProductionFinished":
        return ARGS._amount+" chips produced!";
      default:
        console.warn("Unhandled event '"+event_name+"' from contract 'CasinoToken'!");
        return null;
    }
  }
}
