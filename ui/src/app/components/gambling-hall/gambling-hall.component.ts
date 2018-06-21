import { Component, OnInit } from '@angular/core';
import {GamblingHallService} from "../../service/gambling-hall.service";
import {Game} from "../../model/game";
import {GamblingHall} from "../../model/gambling-hall";
import {AccountService} from "../../service/account.service";

@Component({
  selector: 'app-gaming-hall',
  templateUrl: './gaming-hall.component.html',
  styleUrls: ['./gaming-hall.component.css']
})
export class GamingHallComponent implements OnInit {

  games: Game[];
  gamblingHall: GamblingHall;

  constructor(private gamblingHallService: GamblingHallService,
              private accountService: AccountService) {

    this.games = [];
    this.gamblingHall = new GamblingHall();

    this.gamblingHallService.getName().then(name => {
      this.gamblingHall.name = name;
    });
    this.gamblingHallService.getAddress().then(address => {
      this.gamblingHall.address = address;
    });
    this.gamblingHallService.getOwnerAddress().then(address => {
      this.accountService.getExternalAccount(address).then(externalAccount => {
        this.gamblingHall.owner = externalAccount;
      }).catch(reason => console.error("accountService.getExternalAccount(this.gamblingHall.owner.address/"+this.gamblingHall.owner.address+")", reason));
    });
    this.gamblingHallService.getManagerAddress().then(address => {
      this.accountService.getExternalAccount(address).then(externalAccount => {
        this.gamblingHall.manager = externalAccount;
      }).catch(reason => console.error("accountService.getExternalAccount(this.gamblingHall.manager.address/"+this.gamblingHall.manager.address+")", reason));
    });

    this.gamblingHallService.getGames().then(gameNames => {
      gameNames.forEach(gameName => {
        this.games.push(new Promise((resolve, reject) => {
          return this.gamblingHallService.getGameAddress(gameName).then(address => {
            return this.gamblingHallService.getGameType(gameName).then(type => {
              const game = new Game();
              game.name = name;
              game.type = type;
              game.gamblingHall = this.gamblingHall;
              return resolve(game);
            });
          });
        }));
      });
    });
  }

  ngOnInit() {
  }

}
