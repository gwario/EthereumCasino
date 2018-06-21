import { Component, OnInit } from '@angular/core';
import {GamblingHallService} from "../../service/gambling-hall.service";
import {Game} from "../../model/game";
import {GamblingHall} from "../../model/gambling-hall";
import {AccountService} from "../../service/account.service";
import {Casino} from "../../model/casino";

@Component({
  selector: 'app-gambling-hall',
  templateUrl: './gambling-hall.component.html',
  styleUrls: ['./gambling-hall.component.css']
})
export class GamblingHallComponent implements OnInit {

  games: Game[];
  gamblingHall: GamblingHall;

  constructor(private gamblingHallService: GamblingHallService,
              private accountService: AccountService) {

    this.games = [];
    this.gamblingHall = new GamblingHall();
    this.gamblingHall.casino = new Casino();

    this.gamblingHallService.getName().then(name => {
      this.gamblingHall.name = name;
    });
    this.gamblingHallService.getAddress().then(address => {
      accountService.getContractAccount(address).then(account => {
        this.gamblingHall.address = account.address;
        this.gamblingHall.tokenBalance = account.tokenBalance;
        this.gamblingHall.etherBalance = account.etherBalance;
      }).catch(reason => console.error("accountService.getContractAccount(this.gamblingHall.address/"+this.gamblingHall.address+")", reason));
    });

    this.gamblingHallService.getCasinoAddress().then(address => {
      this.gamblingHall.casino.address = address;
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

    this.gamblingHallService.getGameNames().then(gameNames => {
      gameNames.forEach(gameName => {
        this.gamblingHallService.getGameAddress(gameName).then(gameAddress => {
          this.gamblingHallService.getGameType(gameName).then(gameType => {
            this.accountService.getContractAccount(gameAddress).then(account => {
              console.log(account)
              const game = new Game();
              game.address = account.address;
              game.tokenBalance = account.tokenBalance;
              game.etherBalance = account.etherBalance;
              game.name = gameName;
              game.type = gameType;
              game.gamblingHall = this.gamblingHall;
              this.games.push(game);
              console.log(this.games)
            });
          });
        }).catch(reason => console.error("accountService.getGameNames()", reason));
      });
    });
  }

  ngOnInit() {
  }
}
