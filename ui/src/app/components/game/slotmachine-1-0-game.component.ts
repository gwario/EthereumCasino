import {Component, Input, OnInit} from '@angular/core';
import {SlotmachineService} from "../../service/slotmachine.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {GamblingHallService} from "../../service/gambling-hall.service";
import {OnNameChange} from "../../on-name-change";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-slotmachine-1-0-game',
  templateUrl: './slotmachine-1-0-game.component.html',
  styleUrls: ['./slotmachine-1-0-game.component.css']
})
export class Slotmachine10GameComponent implements OnInit, OnNameChange {

  private _name: string;

  address: string;
  type: string;
  superviserAddress: string;
  gamblingHallAddress: string;
  available: boolean;

  symbol: string;
  prize: string;
  price: string;
  deposit: string;
  possibilities: string;

  canClaim: boolean;

  constructor(private web3Service: Web3Service,
              private slotmachineService: SlotmachineService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService) {

    this.address = this.slotmachineService.getAddress();
    this.casinoTokenService.getSymbol().then(value => this.symbol = value);
    this.gamblingHallAddress = this.gamblingHallService.getAddress();
    this.slotmachineService.isAvailable().then(value => this.available = value);
    this.slotmachineService.getPrice().then(value => this.price = value.toString());
    this.slotmachineService.getPrize().then(value => {
      this.prize = value.toString();
    });
    this.slotmachineService.getDeposit().then(value => {
      this.deposit = value.toString();
    });
    this.slotmachineService.getPossibilities().then(value => {
      this.possibilities = value.toString();
    });
    this.slotmachineService.getSuperviserAddress().then(supervisorAddress => {
      this.superviserAddress = supervisorAddress;
    });
  }

  ngOnInit() {
  }

  onNameChange(name: string) {
    if(this.name == null) {
      console.warn("Name undefined! Component not yet ready for initialization.");
      return;
    } else {
      console.debug("Got valid name: %s! Initializing component...", name);
    }

    this.gamblingHallService.getGameType(this.name).then(type => this.type = this.web3Service.hexToUtf8(type));

    this.web3Service.allOrNothingSlotmachineContract.events.Hold()
      .on('data', data => this.available = false)
      .on('error', console.error);
    this.web3Service.allOrNothingSlotmachineContract.events.Released()
      .on('data', data => this.available = true)
      .on('error', console.error);
  }

  @Input()
  set name(name: string) { this._name = name; this.onNameChange(this._name); }
  get name(): string { return this._name; }
}
