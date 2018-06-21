import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-play-slotmachine-game',
  templateUrl: './play-slotmachine-game.component.html',
  styleUrls: ['./play-slotmachine-game.component.css']
})
export class PlaySlotmachineGameComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PlaySlotmachineGameComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
