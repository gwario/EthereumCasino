import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from "../../service/web3.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {OnAddressChange} from "../../on-address-change";
import BigNumber from "bignumber.js";
import {PriceService} from "../../service/price.service";
import {CasinoService} from "../../service/casino.service";

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css']
})
export class BalancesComponent implements OnInit, OnAddressChange {

  private _address: string;

  etherBalanceEuro: BigNumber;
  etherBalance: BigNumber;
  tokenBalanceEuro: BigNumber;
  tokenBalance: BigNumber;
  tokenPrice: BigNumber;
  tokenSymbol: string;

  constructor(private web3Service: Web3Service,
              private casinoTokenService: CasinoTokenService,
              private casinoService: CasinoService,
              private priceService: PriceService) {

    this.etherBalanceEuro = new BigNumber(0);
    this.etherBalance = new BigNumber(0);
    this.tokenBalanceEuro = new BigNumber(0);
    this.tokenBalance = new BigNumber(0);
    this.tokenPrice = new BigNumber(0);
    this.casinoTokenService.getSymbol().then(value => this.tokenSymbol = value);
    this.casinoService.getTokenPrice().then(value => this.tokenPrice = new BigNumber(value.toString()));

    this.priceService.eurPerEther().subscribe(value => {
      this.etherBalanceEuro = this.etherBalance.times(value);
    });
    this.priceService.eurPerWei().subscribe(value => {
      this.tokenBalanceEuro = this.tokenBalance.times(this.tokenPrice).times(value);
    });
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

    this.casinoTokenService.getTokenBalance(this.address).then(value => this.tokenBalance = new BigNumber(value.toString()));
    this.web3Service.getBalance(this.address).then(value => {
      this.etherBalance = new BigNumber(this.web3Service.fromWei(value, 'ether'));
    });

    //TODO listen for all events that can change this components content!
    // token produced
    this.web3Service.casinoTokenContract.events.ProductionFinished({ filter: {_owner: this.address}})
      .on('data', data =>
        this.casinoTokenService.getTokenBalance(this.address).then(value =>
          this.tokenBalance = new BigNumber(value)))
      .on('error', console.error);

    //Casino only
    if(this.address == this.web3Service.casinoContract.options.address) {

      this.web3Service.casinoContract.events.EtherBalanceChanged()
        .on('data', data =>
          this.etherBalance = this.web3Service.fromWei(data.returnValues._newBalance, 'ether'))
        .on('error', console.error);

      this.web3Service.casinoContract.events.TokenBalanceChanged()
        .on('data', data =>
          this.tokenBalance = new BigNumber(data.returnValues._newTokenBalance))
        .on('error', console.error);

      this.web3Service.casinoContract.events.TokenPriceChanged()
        .on('data', data =>
          this.tokenPrice = new BigNumber(data.returnValues._newTokenPrice))
        .on('error', console.error);
    }

    this.web3Service.casinoContract.events.CustomerBoughtIn({ filter: {_customer: this.address}})
      .on('data', data => {
        this.web3Service.getBalance(this.address).then(value =>
          this.etherBalance = new BigNumber(this.web3Service.fromWei(value, 'ether')));
        this.casinoTokenService.getTokenBalance(this.address).then(value =>
          this.tokenBalance = value);
      })
      .on('error', console.error);

    this.web3Service.casinoTokenContract.events.CustomerPaidOut({ filter: {_owner: this.address}})
      .on('data', data => {
        this.web3Service.getBalance(this.address).then(value =>
          this.etherBalance = new BigNumber(this.web3Service.fromWei(value, 'ether')));
        this.casinoTokenService.getTokenBalance(this.address).then(value =>
          this.tokenBalance = value);
      })
      .on('error', console.error);
  }


  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
