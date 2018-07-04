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

  stockupWei: BN;
  exchangeFee: BN;
  tokenPrice: BN;
  stockupTokens: BigNumber;
  euroPerWei: BigNumber;
  symbol: string;

  constructor(public dialogRef: MatDialogRef<StockupEtherComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private web3Service: Web3Service,
              private priceService: PriceService) {

    this.stockupWei = new BN(0);
    this.tokenPrice = new BN(0);
    this.stockupTokens = new BigNumber(0);
    this.euroPerWei = new BigNumber(0);

    this.casinoTokenService.getSymbol()
      .then(value => this.symbol = value);

    this.casinoService.getTokenPrice()
      .then(value => {
        this.tokenPrice = value;
        this.stockupWei = this.tokenPrice.muln(500);//suggest ether for 500 tokens
        this.updateStockupTokens();
      });

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }

  ngOnInit() {
  }

  updateStockupTokens() {
    this.stockupTokens = new BigNumber(this.stockupWei.div(this.tokenPrice).toString());
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
