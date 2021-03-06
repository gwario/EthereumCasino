import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import BigNumber from "bignumber.js";
import {Web3Service} from "../../service/web3.service";
import {PriceService} from "../../service/price.service";

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit {

  tokens: number;
  tokensBN: BigNumber;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;
  euroPerWei: BigNumber;

  constructor(public dialogRef: MatDialogRef<BuyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private web3Service: Web3Service,
              private priceService: PriceService) {

    this.exchangeFee = new BigNumber(0);
    this.tokenPrice = new BigNumber(0);
    this.tokens = 50;
    this.tokensBN = new BigNumber(this.tokens);
    this.euroPerWei = new BigNumber(0);

    this.casinoService.getExchangeFee()
      .then(value => this.exchangeFee = value);

    this.casinoService.getTokenPrice()
      .then(value => this.tokenPrice = value);

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }


  updateTokensBn() {
    this.tokensBN = new BigNumber(this.tokens);
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  tokenPriceEther() {
    return this.web3Service.fromWei(this.tokenPrice, 'ether');
  }
  exchangeFeeEther() {
    return this.web3Service.fromWei(this.exchangeFee, 'ether');
  }
  tokensPriceEuro() {
    return this.euroPerWei.times(this.tokenPrice.times(this.tokens).plus(this.exchangeFee)).toFixed(3);
  }
}
