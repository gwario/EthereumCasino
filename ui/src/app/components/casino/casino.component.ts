import {Component, Input, OnInit} from '@angular/core';
import {CasinoService} from "../../service/casino.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {GamblingHallService} from "../../service/gambling-hall.service";
import {AccountService} from "../../service/account.service";
import {ContractService} from "../../service/contract.service";
import {Web3Service} from "../../service/web3.service";
import {OnAddressChange} from "../../on-address-change";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.css']
})
export class CasinoComponent implements OnInit, OnAddressChange {

  private _address: string;

  name: string;
  opened: boolean;
  tokenPrice: BigNumber;
  exchangeFee: BigNumber;

  ownerAddress: string;
  managerAddress: string;
  tokenAddress: string;
  gamblingHallAddress: string;

  constructor(private casinoServce: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private accountService: AccountService,
              private contractService: ContractService,
              private web3Service: Web3Service) {

    this.tokenPrice = new BigNumber(0);
    this.exchangeFee = new BigNumber(0);
    this.tokenAddress = this.casinoTokenService.getAddress();
    this.gamblingHallAddress = this.gamblingHallService.getAddress();

    this.casinoServce.getOwnerAddress().then(address => {
      this.ownerAddress = address;
    }).catch(reason => console.error(reason));
    this.casinoServce.getManagerAddress().then(address => {
      this.managerAddress = address;
    }).catch(reason => console.error(reason));
    this.casinoServce.isOpened().then(value => {
      this.opened = value;
    }).catch(reason => console.error(reason));
    this.casinoServce.getTokenPrice().then(value => {
      this.tokenPrice = this.web3Service.fromWei(value, 'ether');
    }).catch(reason => console.error(reason));
    this.casinoServce.getExchangeFee().then(value => {
      this.exchangeFee = this.web3Service.fromWei(value, 'ether');
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
