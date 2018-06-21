import {Component, Input, OnInit} from '@angular/core';
import {Game} from "../../model/game";
import {AllOrNothingSlotmachine} from "../../model/all-or-nothing-slotmachine";
import {SlotmachineService} from "../../service/slotmachine.service";
import {CasinoTokenService} from "../../service/casino-token.service";
import {AccountService} from "../../service/account.service";

@Component({
  selector: 'app-slotmachine-1-0-game',
  templateUrl: './slotmachine-1-0-game.component.html',
  styleUrls: ['./slotmachine-1-0-game.component.css']
})
export class Slotmachine10GameComponent implements OnInit {

  @Input() game: Game;

  slotmachine: AllOrNothingSlotmachine;

  isAvailable: boolean;
  canClaim: boolean;

  constructor(private slotmachineService: SlotmachineService,
              private casinoTokenService: CasinoTokenService,
              private accountService: AccountService) {
  }

  ngOnInit() {
    this.slotmachine = new AllOrNothingSlotmachine();
    this.slotmachine.gamblingHall = this.game.gamblingHall;
    this.slotmachine.type = this.game.type;

    this.slotmachineService.getName().then(value => {
      this.slotmachine.name = value;
    });

    this.accountService.getContractAccount(this.game.address).then(account => {
      this.slotmachine.address = account.address;
      this.slotmachine.tokenBalance = account.tokenBalance;
      this.slotmachine.etherBalance = account.etherBalance;
    }).catch(reason => console.error("accountService.getContractAccount(this.slotmachine.address/"+this.game.address+")", reason));

    this.slotmachineService.isAvailable().then(value => {
      this.slotmachine.available = value;
    });
    this.slotmachineService.getPrice().then(value => {
      this.slotmachine.price = value;
    });
    this.slotmachineService.getPrize().then(value => {
      this.slotmachine.prize = value;
    });
    this.slotmachineService.getDeposit().then(value => {
      this.slotmachine.deposit = value;
    });
    this.slotmachineService.getPossibilities().then(value => {
      this.slotmachine.possibilities = value;
    });
    this.slotmachineService.getSuperviserAddress().then(supervisorAddress => {
      console.log("supervisorAddress", supervisorAddress);
      this.accountService.getExternalAccount(supervisorAddress).then(externalAccount => {
        console.log("supervisorAccount", externalAccount);
        this.slotmachine.superviser.address = externalAccount.address;
        this.slotmachine.superviser.etherBalance = externalAccount.etherBalance;
        this.slotmachine.superviser.tokenBalance = externalAccount.tokenBalance;
        this.slotmachine.superviser.roles = externalAccount.roles;
      }).catch(reason => console.error("accountService.getExternalAccount(this.slotmachine.superviser.address/"+this.slotmachine.superviser.address+")", reason));
    });
  }

  claim() {
    console.log("claim: TODO");
  }

  pullTheLever() {
    console.log("pull the lever: TODO");
  }
}
