import {Component, Inject, OnInit} from '@angular/core';
import BigNumber from "bignumber.js";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import {Web3Service} from "../../service/web3.service";
import {PriceService} from "../../service/price.service";
import BN from "bn.js";

@Component({
  selector: 'app-change-exchange-fee',
  templateUrl: './change-exchange-fee.component.html',
  styleUrls: ['./change-exchange-fee.component.css']
})
export class ChangeExchangeFeeComponent implements OnInit {

  currentExchangeFee: BN;
  tokenPrice: BN;
  exchangeFee: BN;
  euroPerWei: BigNumber;

  constructor(public dialogRef: MatDialogRef<ChangeExchangeFeeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private web3Service: Web3Service,
              private priceService: PriceService) {


    this.currentExchangeFee = new BN(0);
    this.tokenPrice = new BN(0);
    this.exchangeFee = new BN(0);
    this.euroPerWei = new BigNumber(0);

    this.casinoService.getExchangeFee()
      .then(value => {
        this.currentExchangeFee = value;
        this.exchangeFee = value;
      });

    this.casinoService.getTokenPrice()
      .then(value => this.tokenPrice = value);

    this.priceService.eurPerWei().subscribe(value => this.euroPerWei = value);
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  currentExchangeFeeEther() {
    return this.web3Service.fromWei(this.currentExchangeFee.toString(), 'ether');
  }
  tokenPriceEther() {
    return this.web3Service.fromWei(this.tokenPrice.toString(), 'ether');
  }
  exchangeFeeEther() {
    return this.web3Service.fromWei(this.exchangeFee.toString(), 'ether');
  }
}
