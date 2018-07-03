import {Component, OnInit} from '@angular/core';
import {AccountService} from "../../service/account.service";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  externalAccountAddresses: Set<string>;

  constructor(private accountService: AccountService) {
    //TODO maybe init and the slice in callback
    this.externalAccountAddresses = new Set();
    this.accountService.getExternalAccounts().subscribe(value => {
      this.externalAccountAddresses = value;
    });
  }

  ngOnInit() {
  }
}
