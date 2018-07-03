import {Component, Inject, OnInit} from '@angular/core';
import BigNumber from "bignumber.js";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CasinoService} from "../../service/casino.service";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-change-exchange-fee',
  templateUrl: './change-exchange-fee.component.html',
  styleUrls: ['./change-exchange-fee.component.css']
})
export class ChangeExchangeFeeComponent implements OnInit {

  currentExchangeFee: BigNumber;
  exchangeFee: BigNumber;
  tokenPrice: BigNumber;

  constructor(public dialogRef: MatDialogRef<ChangeExchangeFeeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private casinoService: CasinoService,
              private web3Service: Web3Service) {


    this.currentExchangeFee = new BigNumber(0);
    this.exchangeFee = this.web3Service.fromWei(new BigNumber(14037000000000000), 'ether'); // about 5 €
    this.tokenPrice = new BigNumber(0);

    this.casinoService.getExchangeFee().then(value => {
      this.currentExchangeFee = this.web3Service.fromWei(new BigNumber(value), 'ether');
    });

    this.casinoService.getTokenPrice().then(value => {
      this.tokenPrice = new BigNumber(value);
    });
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
