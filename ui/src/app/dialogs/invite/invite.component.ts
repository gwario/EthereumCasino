import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {

  address: string;

  constructor(public dialogRef: MatDialogRef<InviteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.address = "";
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
