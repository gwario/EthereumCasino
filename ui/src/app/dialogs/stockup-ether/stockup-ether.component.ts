import {Component, Inject, OnInit} from '@angular/core';
import {ProduceTokensComponent} from "../produce-tokens/produce-tokens.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-stockup-ether',
  templateUrl: './stockup-ether.component.html',
  styleUrls: ['./stockup-ether.component.css']
})
export class StockupEtherComponent implements OnInit {

  stockupEther: number;

  constructor(public dialogRef: MatDialogRef<StockupEtherComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.stockupEther = 5;
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
