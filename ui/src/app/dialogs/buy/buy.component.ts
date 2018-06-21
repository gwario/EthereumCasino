import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit {

  tokens: number;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;
  ether: BigNumber;

  constructor(public dialogRef: MatDialogRef<BuyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService) {

    this.tokens = 50;
    this.exchangeFee = new BigNumber(0);
    this.tokenPrice = new BigNumber(0);
    this.ether = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));

    this.casinoService.getExchangeFee().then(value => {
      this.exchangeFee = new BigNumber(value);
    });

    this.casinoService.getTokenPrice().then(value => {
      this.tokenPrice = value;
    });
  }


  ngOnInit() {
  }

  onKey(newTokens) {
    this.tokens = newTokens;
    this.ether = this.exchangeFee.plus(this.tokenPrice.times(this.tokens));
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
