import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import BigNumber from "bignumber.js";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit {

  tokens: BigNumber;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;
  wei: BigNumber;

  constructor(public dialogRef: MatDialogRef<BuyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private web3Service: Web3Service) {

    this.tokens = new BigNumber(50);
    this.exchangeFee = new BigNumber(0);
    this.tokenPrice = new BigNumber(0);
    this.wei = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));

    this.casinoService.getExchangeFee().then(value => {
      this.exchangeFee = new BigNumber(value);
      this.wei = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));
    });

    this.casinoService.getTokenPrice().then(value => {
      this.tokenPrice = new BigNumber(value);
      this.wei = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));
    });
  }


  ngOnInit() {
  }

  onChange() {
    this.wei = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
