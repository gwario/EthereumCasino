import {Component, OnInit} from '@angular/core';
import {CasinoService} from "../../service/casino.service";
import {Casino} from "../../model/casino";
import {CasinoTokenService} from "../../service/casino-token.service";
import {GamblingHallService} from "../../service/gambling-hall.service";
import {AccountService} from "../../service/account.service";
import {ExternalAccount} from "../../model/external-account";
import {InviteComponent} from "../../dialogs/invite/invite.component";
import {MatDialog} from "@angular/material";

declare let window: any;

@Component({
  selector: 'app-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.css']
})
export class CasinoComponent implements OnInit {

  casino: Casino;

  accounts: ExternalAccount[];

  constructor(private casinoServce: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private accountService: AccountService,
              public dialog: MatDialog) {

    this.casino = new Casino();

    //populate casino object
    casinoServce.getAddress().then(address => {
      accountService.getContractAccount(address).then(account => {
        this.casino.address = account.address;
        this.casino.tokenBalance = account.tokenBalance;
        this.casino.etherBalance = account.etherBalance;
      }).catch(reason => console.error("accountService.getContractAccount(this.casino.address/"+this.casino.address+")", reason));
    });
    casinoServce.getName().then(value => {
      this.casino.name = value;
    });
    casinoServce.getOwnerAddress().then(address => {
      accountService.getExternalAccount(address).then(externalAccount => {
        this.casino.owner = externalAccount;
      }).catch(reason => console.error("accountService.getExternalAccount(this.casino.owner.address/"+this.casino.owner.address+")", reason));
    });
    casinoServce.getManagerAddress().then(address => {
      accountService.getExternalAccount(address).then(externalAccount => {
          this.casino.manager = externalAccount;
        }).catch(reason => console.error("accountService.getExternalAccount(this.casino.manager.address/"+this.casino.manager.address+")", reason));
    });

    casinoTokenService.getSymbol().then(value => {
      this.casino.token.symbol = value;
    });
    casinoTokenService.getAddress().then(value => {
      this.casino.token.address = value;
    });
    gamblingHallService.getAddress().then(value => {
      this.casino.gamblingHall.address = value;
    });
    casinoServce.isOpened().then(value => {
      this.casino.opened = value;
    });
    casinoServce.getTokenPrice().then(value => {
      this.casino.tokenPrice = value;
    });
    casinoServce.getExchangeFee().then(value => {
      this.casino.exchangeFee = value;
    });
  }

  ngOnInit() {
  }

  openInviteDialog() {
    let dialogRef = this.dialog.open(InviteComponent);
    dialogRef.afterClosed().subscribe(address => {
      console.log(address)
      if(address) {
        console.debug("invite: ", address);
        this.accountService.invite(address);
      } else {
        console.debug("invite: cancel");
      }
    });
  }
}
