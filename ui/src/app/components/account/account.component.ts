import {Component, Input, OnInit} from '@angular/core';
import {ExternalAccount} from "../../model/external-account";
import {CasinoTokenService} from "../../service/casino-token.service";
import {CasinoService} from "../../service/casino.service";
import {AccountService} from "../../service/account.service";
import {MatDialog} from "@angular/material";
import {ProduceTokensComponent} from "../../dialogs/produce-tokens/produce-tokens.component";
import {StockupEtherComponent} from "../../dialogs/stockup-ether/stockup-ether.component";
import BigNumber from "bignumber.js";
import {BuyComponent} from "../../dialogs/buy/buy.component";
import {PlaySlotmachineGameComponent} from "../../dialogs/play-slotmachine-game/play-slotmachine-game.component";
import {SlotmachineService} from "../../service/slotmachine.service";
import {ContractService} from "../../service/contract.service";
import {ChangeExchangeFeeComponent} from "../../dialogs/change-exchange-fee/change-exchange-fee.component";
import {Web3Service} from "../../service/web3.service";
import {OnAddressChange} from "../../on-address-change";
import BN from "bn.js";
import {ChangeTokenPriceComponent} from "../../dialogs/change-token-price/change-token-price.component";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnAddressChange {

  private _address: string;

  etherBalance: BigNumber = new BigNumber(0);
  tokenBalance: BigNumber = new BigNumber(0);
  roles: string[];

  casinoOpened: boolean;

  slotmachineAvailable: boolean;
  slotmachinePlaying: boolean;

  constructor(private accountService: AccountService,
              private contractService: ContractService,
              private casinoTokenService: CasinoTokenService,
              private casinoService: CasinoService,
              private slotmachineService: SlotmachineService,
              private web3Service: Web3Service,
              public dialog: MatDialog) {

    this.etherBalance = new BigNumber(0);
    this.tokenBalance = new BigNumber(0);
    this.roles = [];

    this.casinoService.isOpened().then(value => {
      this.casinoOpened = value;
    }).catch(reason => console.error(reason));
    this.slotmachineService.isAvailable().then(value => {
      this.slotmachineAvailable = value;
    }).catch(reason => console.error(reason));
  }

  ngOnInit() {
  }

  onAddressChange(address: string) {
    if(this.address == null) {
      console.warn("Address undefined! Component not yet ready for initialization.");
      return;
    } else {
      console.debug("Got valid address: %s! Initializing component...", address);
    }

    this.casinoTokenService.getTokenBalance(this.address).then(value => this.tokenBalance = value);
    this.web3Service.getBalance(this.address).then(value => {
      this.etherBalance = new BigNumber(this.web3Service.fromWei(value, 'ether'));
    });

    this.accountService.getRoles(this.address).then(value => this.roles = Array.from(value));

    //TODO listen for all events that can change this components content!

    this.web3Service.casinoTokenContract.events.ProductionFinished({
      filter: {_owner: this.address}
    })
      .on('data', data => {
        console.log("address: "+this.address, event); // same results as the optional callback above
        this.casinoTokenService.getTokenBalance(this.address).then(value => {
          // this.tokenBalance = value.toString();
        });
      })
      .on('error', console.error);

    //casino open
    this.web3Service.casinoContract.events.Opened()
      .on('data', data => {
        console.log("event: ", data);
        this.casinoOpened = true;
      }).on('error', console.error);
    this.web3Service.casinoContract.events.Closed()
      .on('data', data => {
        console.log("event: ", data);
        this.casinoOpened = false;
      }).on('error', console.error);
  }

  removeAccount(): void {
    console.log("removeAccount");
    this.accountService.remove(this.address);
  }

  cashout() {
    console.debug("cashout");
    this.casinoService.getExchangeFee().then(exchangeFee => {
      this.casinoService.cashout(exchangeFee, this.address).then(value => {
        console.log("cashout receipt", value)
      });
    });
  }

  openBuyDialog() {
    let dialogRef = this.dialog.open(BuyComponent);
    dialogRef.afterClosed().subscribe(tokens => {
      if(tokens) {
        console.debug("buy:", tokens);

        this.casinoService.getExchangeFee().then(exchangeFee => {
          this.casinoService.getTokenPrice().then(tokenPrice => {
            let valueEther = tokens.times(tokenPrice).plus(exchangeFee);

            this.casinoService.buy(valueEther, this.address);
          });
        });
      } else {
        console.debug("buy: cancel");
      }
    });
  }

  openProduceDialog() {
    let dialogRef = this.dialog.open(ProduceTokensComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.debug("produce:", result);
        this.casinoTokenService.produce(result.address, result.tokens, this.address);
      } else {
        console.debug("produce: cancel");
      }
    });
  }

  payout() {
    console.debug("payout");
    this.casinoService.payout(this.address);
  }

  openPlaySlotmachineDialog() {
    let dialogRef = this.dialog.open(PlaySlotmachineGameComponent, {
      data: {
        slotmachinePlaying: this.slotmachinePlaying
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.debug("slotmachine: ", result);
        if(result.pullTheLever)
          this.slotmachineService.pullTheLever(this.address).then(success => {
            if(success)
              this.slotmachinePlaying = true;
            else
              console.warn("Slotmachine.pullTheLever failed");
          });
        else if(result.claim)
          this.slotmachineService.claim(this.address).then(success => {
            if(success)
              this.slotmachinePlaying = false;
            else
              console.warn("Slotmachine.claim failed");
          });
      } else {
        console.debug("slotmachine: cancel");
      }
    });
  }

  openStockupDialog() {
    let dialogRef = this.dialog.open(StockupEtherComponent);
    dialogRef.afterClosed().subscribe(stockupEther => {
      if(stockupEther) {
        console.debug("stockup: ", stockupEther);

        this.casinoService.stockup(new BN(stockupEther.toString()), this.address);
      } else {
        console.debug("stockup: cancel");
      }
    });
  }

  openCasino() {
    console.debug("open casino");
    this.casinoService.open(this.address);
  }

  closeCasino() {
    console.debug("close casino");
    this.casinoService.close(this.address);
  }

  holdSlotmachine() {
    console.debug("hold slotmachine");
    this.slotmachineService.hold(this.address);
  }

  releaseSlotmachine() {
    console.debug("release slotmachine");
    this.slotmachineService.release(this.address);
  }

  openTokenPriceDialog() {
    console.debug("change token price");
    let dialogRef = this.dialog.open(ChangeTokenPriceComponent);
    dialogRef.afterClosed().subscribe(newTokenPrice => {
      if(newTokenPrice) {
        console.debug("new token price: ", newTokenPrice);

        this.casinoService.setTokenPrice(newTokenPrice, this.address);

      } else {
        console.debug("token price: cancel");
      }
    });
  }

  openExchangeFeeDialog() {
    console.debug("change exchange fee");
    let dialogRef = this.dialog.open(ChangeExchangeFeeComponent);
    dialogRef.afterClosed().subscribe(newExchangeFee => {
      if(newExchangeFee) {
        console.debug("new exchange fee: ", newExchangeFee);

        this.casinoService.setExchangeFee(newExchangeFee, this.address);

      } else {
        console.debug("exchange fee: cancel");
      }
    });
  }

  hasNoRoles(): boolean {
    return this.roles.length == 0;
  }

  isCasinoTokenOwner(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_CASINO_TOKEN_OWNER);
  }

  isCasinoOwner(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_CASINO_OWNER)
  }

  isCasinoManager(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_CASINO_MANAGER)
  }

  isGamblingHallOwner(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_GAMBLING_HALL_OWNER)
  }

  isGamblingHallManager(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_GAMBLING_HALL_MANAGER)
  }

  isSlotmachineSupervisor(): boolean {
    return this.roles.some(value => value == ExternalAccount.ROLE_GAME_SUPERVISOR)
  }


  produceEnabled(): boolean {
    return this.isCasinoTokenOwner();
  }
  producedDisabledTooltip(): string {
    return "CasinoToken owner only!";
  }

  payoutEnabled() {
    return !this.casinoOpened && this.isCasinoOwner();
  }
  payoutDisabledTooltip() {
    return "Casino casino needs to be closed and account must be owner!";
  }

  stockupEnabled() {
    return this.isCasinoOwner();
  }
  stockupDisabledTooltip() {
    return "Account needs to be casino owner!";
  }

  buyEnabled() {
    return this.casinoOpened && this.etherBalance.gt(0);
  }
  buyDisabledTooltip() {
    return "Casino needs to be opened and account needs ether!";
  }

  cashoutEnabled() {
    return this.casinoOpened && this.tokenBalance.gt(0);
  }
  cashoutDisabledTooltip() {
    return "Casino needs to be opened and accounts needs ether for exchange fee!";
  }

  openCasinoEnabled() {
    return !this.casinoOpened && (this.isCasinoOwner() || this.isCasinoManager());
  }
  openCasinoDisabledTooltip() {
    return "Casino needs to be closed and account must be owner or manager!";
  }

  closeCasinoEnabled() {
    return this.casinoOpened && (this.isCasinoOwner() || this.isCasinoManager());
  }
  closeCasinoDisabledTooltip() {
    return "Casino needs to be opened and account must be owner or manager!";
  }

  tokenPriceEnabled() {
    return !this.casinoOpened && this.isCasinoManager();
  }
  tokenPriceDisabledTooltip() {
    return "Casino must be closed and account needs to be manager!";
  }

  exchangeFeeEnabled() {
    return !this.casinoOpened && this.isCasinoManager();
  }
  exchangeFeeDisabledTooltip() {
    return "Casino must be closed and account needs to be manager!";
  }

  holdSlottmachineEnabled() {
    return this.slotmachineAvailable && this.isSlotmachineSupervisor();
  }
  holdSlottmachineDisabledTooltip() {
    return "Slotmachine must be available and account needs to be supervisor!";
  }

  releaseSlottmachineEnabled() {
    return !this.slotmachineAvailable && this.isSlotmachineSupervisor();
  }
  releaseSlottmachineDisabledTooltip() {
    return "Slotmachine must be on hold and account needs to be supervisor!";
  }

  playSlottmachineEnabled() {
    return this.slotmachineAvailable;
  }
  playSlottmachineDisabledTooltip() {
    return "The slotmachine must be available!";
  }


  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
