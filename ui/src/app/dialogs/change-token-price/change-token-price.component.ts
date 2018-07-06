import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import {Web3Service} from "../../service/web3.service";
import BigNumber from "bignumber.js";
import {PriceService} from "../../service/price.service";

@Component({
  selector: 'app-change-token-price',
  templateUrl: './change-token-price.component.html',
  styleUrls: ['./change-token-price.component.css']
})
export class ChangeTokenPriceComponent implements OnInit {

  currentTokenPrice: BigNumber;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;
  euroPerWei: BigNumber;

  constructor(public dialogRef: MatDialogRef<ChangeTokenPriceComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private web3Service: Web3Service,
              private priceService: PriceService) {



    this.currentTokenPrice = new BigNumber(0);
    this.exchangeFee = new BigNumber(0);
    this.tokenPrice = new BigNumber(0);
    this.euroPerWei = new BigNumber(0);

    this.casinoService.getTokenPrice()
      .then(value => {
        this.currentTokenPrice = value;
        this.tokenPrice = value;
      });

    this.casinoService.getExchangeFee()
      .then(value => this.exchangeFee = value);

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  currentTokenPriceEther() {
    return this.web3Service.fromWei(this.currentTokenPrice, 'ether');
  }
  tokenPriceEther() {
    return this.web3Service.fromWei(this.tokenPrice, 'ether');
  }
  exchangeFeeEther() {
    return this.web3Service.fromWei(this.exchangeFee, 'ether');
  }
}
