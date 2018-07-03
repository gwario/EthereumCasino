import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from "../../service/web3.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {OnAddressChange} from "../../on-address-change";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css']
})
export class BalancesComponent implements OnInit, OnAddressChange {

  private _address: string;

  etherBalance: BigNumber;
  tokenBalance: BigNumber;
  tokenSymbol: string;

  constructor(private web3Service: Web3Service,
              private casinoTokenService: CasinoTokenService) {

    this.etherBalance = new BigNumber(0);
    this.tokenBalance = new BigNumber(0);
    this.casinoTokenService.getSymbol().then(value => this.tokenSymbol = value);
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

    //TODO listen for all events that can change this components content!

    this.web3Service.casinoTokenContract.events.ProductionFinished({
      filter: {_owner: this.address}
    })
      .on('data', data => {
        console.log("address: "+this.address, event); // same results as the optional callback above
        this.casinoTokenService.getTokenBalance(this.address).then(value => {
          this.tokenBalance = value;
        });
      })
      .on('error', console.error);
  }


  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
