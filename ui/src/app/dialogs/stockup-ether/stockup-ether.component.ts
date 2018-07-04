import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import BigNumber from "bignumber.js";
import {Web3Service} from "../../service/web3.service";
import {PriceService} from "../../service/price.service";
import BN from "bn.js";
import {CasinoService} from "../../service/casino.service";
import {CasinoTokenService} from "../../service/casino-token.service";

@Component({
  selector: 'app-stockup-ether',
  templateUrl: './stockup-ether.component.html',
  styleUrls: ['./stockup-ether.component.css']
})
export class StockupEtherComponent implements OnInit {

  stockupWei: number;
  stockupWeiBN: BN;
  exchangeFee: BN;
  tokenPrice: BN;
  stockupTokens: BigNumber;
  euroPerWei: BigNumber;
  symbol: string;

  tokenRoundingMode = BigNumber.ROUND_DOWN;

  constructor(public dialogRef: MatDialogRef<StockupEtherComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private web3Service: Web3Service,
              private priceService: PriceService) {

    this.stockupWei = 0;
    this.stockupWeiBN = new BN(0);
    this.tokenPrice = new BN(0);
    this.stockupTokens = new BigNumber(0);
    this.euroPerWei = new BigNumber(0);

    this.casinoTokenService.getSymbol()
      .then(value => this.symbol = value);

    this.casinoService.getTokenPrice()
      .then(value => {
        this.tokenPrice = value;
        this.stockupWei = new BigNumber(50).times(this.tokenPrice.toString()).toNumber();//suggest ether for 500 tokens
        this.updateStockup();
      });

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }

  ngOnInit() {
  }

  updateStockup() {
    this.stockupTokens = new BigNumber(this.stockupWei.toString()).dividedBy(this.tokenPrice.toString());
    console.log(this.stockupWei)
    // console.log(new BN(this.stockupWei)) // putting it into a BN does not work
    // this.stockupWeiBN = new BN(this.stockupWei);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  stockupEther() {
    return this.web3Service.fromWei(this.stockupWei.toString(), 'ether');
  }
  tokenPriceEther() {
    return this.web3Service.fromWei(this.tokenPrice.toString(), 'ether');
  }
}
