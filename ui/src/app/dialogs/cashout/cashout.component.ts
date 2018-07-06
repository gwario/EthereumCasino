import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Web3Service} from "../../service/web3.service";
import {PriceService} from "../../service/price.service";
import {CasinoService} from "../../service/casino.service";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-cashout',
  templateUrl: './cashout.component.html',
  styleUrls: ['./cashout.component.css']
})
export class CashoutComponent implements OnInit {

  tokens: number;
  tokensBN: BigNumber;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;
  euroPerWei: BigNumber;

  minTokens: number;

  constructor(public dialogRef: MatDialogRef<CashoutComponent>,
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
      .then(value => {
        this.exchangeFee = value;
        this.updateMinTokens();
      });

    this.casinoService.getTokenPrice()
      .then(value => {
        this.tokenPrice = value;
        this.updateMinTokens();
      });

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }


  updateTokensBn() {
    if(this.tokens)
      this.tokensBN = new BigNumber(this.tokens);
  }

  updateMinTokens() {
    this.minTokens = this.exchangeFee.dividedToIntegerBy(this.tokenPrice).toNumber();
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
