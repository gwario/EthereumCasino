import { Component, OnInit } from '@angular/core';
import {ExternalAccount} from "../../model/external-account";
import {AccountService} from "../../service/account.service";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  externalAccounts: ExternalAccount[];

  constructor(private accountService: AccountService) {

    this.externalAccounts = [];

    this.accountService.getExternalAccounts().then(externalAccounts => {
      externalAccounts.forEach(valuePromise => {
        valuePromise.then(value => this.externalAccounts.push(value));
      });
    });
  }

  ngOnInit() {
  }

}
