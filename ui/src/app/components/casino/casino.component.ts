import {Component, Input, OnInit} from '@angular/core';
import {CasinoService} from "../../service/casino.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {GamblingHallService} from "../../service/gambling-hall.service";
import {AccountService} from "../../service/account.service";
import {ContractService} from "../../service/contract.service";
import {Web3Service} from "../../service/web3.service";
import {OnAddressChange} from "../../on-address-change";
import BigNumber from "bignumber.js";
import {PriceService} from "../../service/price.service";
import BN from "bn.js";

@Component({
  selector: 'app-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.css']
})
export class CasinoComponent implements OnInit, OnAddressChange {

  private _address: string;

  name: string;
  opened: boolean;
  tokenPrice: BN;
  exchangeFee: BN;

  ownerAddress: string;
  managerAddress: string;
  tokenAddress: string;
  gamblingHallAddress: string;

  euroPerWei: BigNumber;

  constructor(private casinoServce: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private accountService: AccountService,
              private contractService: ContractService,
              private web3Service: Web3Service,
              private priceService: PriceService) {

    this.tokenPrice = new BN(0);
    this.exchangeFee = new BN(0);
    this.tokenAddress = this.casinoTokenService.getAddress();
    this.gamblingHallAddress = this.gamblingHallService.getAddress();

    this.casinoServce.getOwnerAddress()
      .then(address => this.ownerAddress = address)
      .catch(reason => console.error(reason));

    this.casinoServce.getManagerAddress()
      .then(address => this.managerAddress = address)
      .catch(reason => console.error(reason));

    this.casinoServce.isOpened()
      .then(value => this.opened = value)
      .catch(reason => console.error(reason));

    this.casinoServce.getTokenPrice()
      .then(value => this.tokenPrice = value)
      .catch(reason => console.error(reason));

    this.casinoServce.getExchangeFee()
      .then(value => this.exchangeFee = value)
      .catch(reason => console.error(reason));

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);

    //casino open
    this.web3Service.casinoContract.events.Opened()
      .on('data', data => this.opened = true)
      .on('error', console.error);
    this.web3Service.casinoContract.events.Closed()
      .on('data', data => this.opened = false)
      .on('error', console.error);

    //exchange fee
    this.web3Service.casinoContract.events.ExchangeFeeChanged()
      .on('data', data => this.exchangeFee = new BN(data.returnValues._newExchangeFee))
      .on('error', console.error);

    //token price
    this.web3Service.casinoContract.events.TokenPriceChanged()
      .on('data', data => this.tokenPrice = new BN(data.returnValues._newTokenPrice))
      .on('error', console.error);
  }

  ngOnInit() {
  }

  onAddressChange(address: string) {
  }

  tokenPriceEther() {
    return this.web3Service.fromWei(this.tokenPrice, 'ether');
  }
  exchangeFeeEther() {
    return this.web3Service.fromWei(this.exchangeFee, 'ether');
  }

  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
