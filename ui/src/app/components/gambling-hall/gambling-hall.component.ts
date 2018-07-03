import {Component, Input, OnInit} from '@angular/core';
import {GamblingHallService} from "../../service/gambling-hall.service";
import {Game} from "../../model/game";
import {ContractService} from "../../service/contract.service";
import {Web3Service} from "../../service/web3.service";
import {OnAddressChange} from "../../on-address-change";

@Component({
  selector: 'app-gambling-hall',
  templateUrl: './gambling-hall.component.html',
  styleUrls: ['./gambling-hall.component.css']
})
export class GamblingHallComponent implements OnInit, OnAddressChange {

  private _address: string;

  name: string;
  ownerAddress: string;
  managerAddress: string;
  casinoAddress: string;
  games: Game[];

  constructor(private contractService: ContractService,
              private gamblingHallService: GamblingHallService,
              private web3Service: Web3Service) {

    this.games = [];

    this.gamblingHallService.getName().then(name => {
      this.name = name;
    }).catch(reason => console.error(reason));
    this.gamblingHallService.getCasinoAddress().then(address => {
      this.casinoAddress = address;
    }).catch(reason => console.error(reason));
    this.gamblingHallService.getOwnerAddress().then(address => {
      this.ownerAddress = address;
    }).catch(reason => console.error(reason));
    this.gamblingHallService.getManagerAddress().then(address => {
      this.managerAddress = address;
    }).catch(reason => console.error(reason));
    this.gamblingHallService.getGameNames().then(gameNames => {
      gameNames.forEach(gameName => {
        this.gamblingHallService.getGameAddress(gameName).then(gameAddress => {
          this.gamblingHallService.getGameType(gameName).then(gameType => {

            let game = new Game();

            game.address = gameAddress;
            game.name = this.web3Service.hexToUtf8(gameName);
            game.type = this.web3Service.hexToUtf8(gameType);

            this.games.push(game);

            console.log("this.games", this.games)
          });
        });
      });
    }).catch(reason => console.error(reason));
  }

  ngOnInit() {
  }

  onAddressChange(address: string) {
  }

  @Input()
  set address(address: string) { this._address = address; this.onAddressChange(this._address); }
  get address(): string { return this._address; }
}
