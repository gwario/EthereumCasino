import {Component, Input, OnInit} from '@angular/core';
import {CasinoTokenService} from "../../service/casino-token.service";
import {OnAddressChange} from "../../on-address-change";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-casino-token',
  templateUrl: './casino-token.component.html',
  styleUrls: ['./casino-token.component.css']
})
export class CasinoTokenComponent implements OnInit, OnAddressChange {

  private _address: string;

  name: string;
  symbol: string;
  decimals: number;
  ownerAddress: string;
  totalSupply: string;

  constructor(private casinoTokenService: CasinoTokenService,
              private web3Service: Web3Service) {

    this.casinoTokenService.getName().then(value => {
      this.name = value;
    }).catch(reason => console.error(reason));
    this.casinoTokenService.getSymbol().then(value => {
      this.symbol = value;
    }).catch(reason => console.error(reason));
    this.casinoTokenService.getDecimals().then(value => {
      this.decimals = value;
    }).catch(reason => console.error(reason));
    this.casinoTokenService.getOwnerAddress().then(value => {
      this.ownerAddress = value;
    }).catch(reason => console.error(reason));
    this.casinoTokenService.getTotalSupply().then(value => {
      this.totalSupply = value;
    }).catch(reason => console.error(reason));
  }

  ngOnInit() {
  }

  onAddressChange(address: string) {
    this.web3Service.casinoTokenContract.events.ProductionFinished()
      .on('data', data =>
        this.casinoTokenService.getTotalSupply()
          .then(value => this.totalSupply = value)
          .catch(reason => console.error(reason)))
      .on('error', console.error);
  }

  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
