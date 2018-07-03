import {Component, Input, OnInit} from '@angular/core';
import {CasinoTokenService} from "../../service/casino-token.service";
import {OnAddressChange} from "../../on-address-change";

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

  constructor(private casinoTokenService: CasinoTokenService) {

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
  }

  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
