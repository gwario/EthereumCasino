import {Component, Input, OnInit} from '@angular/core';
import {ExternalAccount} from "../../model/external-account";
import {CasinoTokenService} from "../../service/casino-token.service";
import {CasinoService} from "../../service/casino.service";
import {AccountService} from "../../service/account.service";
import {ContractAccount} from "../../model/contract-account";
import {MatDialog} from "@angular/material";
import {ProduceTokensComponent} from "../../dialogs/produce-tokens/produce-tokens.component";
import {StockupEtherComponent} from "../../dialogs/stockup-ether/stockup-ether.component";
import BigNumber from "bignumber.js";
import {BuyComponent} from "../../dialogs/buy/buy.component";
import {PlaySlotmachineGameComponent} from "../../dialogs/play-slotmachine-game/play-slotmachine-game.component";
import {SlotmachineService} from "../../service/slotmachine.service";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @Input() account: ExternalAccount;

  casinoOpened: boolean;
  slotmachineAvailable: boolean;

  slotmachinePlaying: boolean;

  tokenSymbol: string;
  externalAccounts: ExternalAccount[];
  contractAccounts: ContractAccount[];

  constructor(private casinoTokenService: CasinoTokenService,
              private casinoService: CasinoService,
              private accountService: AccountService,
              private slotmachineService: SlotmachineService,
              public dialog: MatDialog) {
    this.externalAccounts = [];
    this.contractAccounts = [];

    this.casinoTokenService.getSymbol().then(value => {
      this.tokenSymbol = value;
    }).catch(reason => console.error(reason));

    this.casinoService.isOpened().then(value => {
      this.casinoOpened = value;
    }).catch(reason => console.error(reason));

    this.slotmachineService.isAvailable().then(value => {
      this.slotmachineAvailable = value;
    }).catch(reason => console.error(reason));


    this.accountService.getExternalAccounts().then(externalAccounts => {
      externalAccounts.forEach(valuePromise => {
        valuePromise.then(value => this.externalAccounts.push(value));
      });
    });

    this.accountService.getContractAccounts().forEach(valuePromise => {
      valuePromise.then(value => this.contractAccounts.push(value));
    });
  }

  ngOnInit() {
  }

  cashout() {
    console.debug("cashout");
    this.casinoService.getExchangeFee().then(exchangeFee => {
      this.casinoService.cashout(exchangeFee, this.account.address);
    });
  }

  openBuyDialog() {
    let dialogRef = this.dialog.open(BuyComponent);
    dialogRef.afterClosed().subscribe(tokens => {
      if(tokens) {
        console.debug("buy:", tokens);

        this.casinoService.getExchangeFee().then(exchangeFee => {
          this.casinoService.getTokenPrice().then(tokenPrice => {
            let valueEther = new BigNumber(exchangeFee).plus(tokenPrice.times(tokens));

            this.casinoService.buy(valueEther, this.account.address);
          });
        });
      } else {
        console.debug("buy: cancel");
      }
    });
  }

  openProduceDialog() {
    let dialogRef = this.dialog.open(ProduceTokensComponent, {
      data: {
        contractAccounts: this.contractAccounts,
        externalAccounts: this.externalAccounts
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.debug("produce:", result);
        this.casinoTokenService.produce(result.address, result.tokens, this.account.address);
      } else {
        console.debug("produce: cancel");
      }
    });
  }

  payout() {
    console.debug("payout");
    this.casinoService.payout(this.account.address);
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
          this.slotmachineService.pullTheLever(this.account.address).then(success => {
            if(success)
              this.slotmachinePlaying = true;
            else
              console.warn("Slotmachine.pullTheLever failed");
          });
        else if(result.claim)
          this.slotmachineService.claim(this.account.address).then(success => {
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

        this.casinoService.stockup(new BigNumber(stockupEther), this.account.address);
      } else {
        console.debug("stockup: cancel");
      }
    });
  }

  openCasino() {
    console.debug("open casino");
    this.casinoService.open(this.account.address);
  }

  closeCasino() {
    console.debug("close casino");
    this.casinoService.close(this.account.address);
  }

  holdSlotmachine() {
    console.debug("hold slotmachine");
    this.slotmachineService.hold(this.account.address);
  }

  releaseSlotmachine() {
    console.debug("release slotmachine");
    this.slotmachineService.release(this.account.address);
  }
}
