import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Game} from "../../model/game";
import {GamblingHallService} from "../../service/gambling-hall.service";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-manage-games',
  templateUrl: './manage-games.component.html',
  styleUrls: ['./manage-games.component.css']
})
export class ManageGamesComponent implements OnInit {

  name: string;
  address: string;

  games: Map<string, Game>;

  constructor(public dialogRef: MatDialogRef<ManageGamesComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private gamblingHallService: GamblingHallService,
              private web3Service: Web3Service) {

    this.games = new Map<string, Game>();

    this.gamblingHallService.getGameNames().then(gameNames => {

      gameNames.forEach(gameName => {

        this.games.set(gameName, new Game());

        this.games.get(gameName).name = gameName;

        this.gamblingHallService.getGameAddress(gameName).then(address => {
          this.games.get(gameName).address = address;
        });
      });
    });
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  addGame() {
    if(this.address && this.name) {
      this.gamblingHallService.addGame(this.name, this.address, this.data.address);
    }
  }

  removeGame(name: string) {
    if(name) {
      this.gamblingHallService.removeGame(name, this.data.address);
    }
  }

  gameNames() {
    return Array.from(this.games.keys());
  }

  hexToUtf8(hex: string): string {

    return this.web3Service.hexToUtf8(hex);
  }
}
