import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-produce-tokens',
  templateUrl: './produce-tokens.component.html',
  styleUrls: ['./produce-tokens.component.css']
})
export class ProduceTokensComponent implements OnInit {

  produceTokens: number;
  produceAccountAddress: string;

  constructor(public dialogRef: MatDialogRef<ProduceTokensComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.produceTokens = 200;
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }


  setToList(set: Set<string>): string[] {
    const list: string[] = [];
    set.forEach(value => list.push(value));
    return list;
  }
}
