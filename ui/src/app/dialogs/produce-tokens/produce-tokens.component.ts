import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ContractService} from "../../service/contract.service";
import {AccountService} from "../../service/account.service";
import {ContractAccount} from "../../model/contract-account";

@Component({
  selector: 'app-produce-tokens',
  templateUrl: './produce-tokens.component.html',
  styleUrls: ['./produce-tokens.component.css']
})
export class ProduceTokensComponent implements OnInit {

  produceTokens: number;
  produceAccountAddress: string;
  externalAccounts: Set<string>;
  accountRoles: Map<string, Set<string>>;
  contractAccounts: ContractAccount[];

  constructor(public dialogRef: MatDialogRef<ProduceTokensComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private contractService: ContractService,
              private accountService: AccountService) {

    this.produceTokens = 200;
    this.contractService.getContractAccounts().subscribe(value => this.contractAccounts = value);
    this.accountService.getExternalAccounts().subscribe(value => {

      this.externalAccounts = value;

      this.externalAccounts.forEach(address =>
        this.accountService.getRoles(address).then(roles =>
          this.accountRoles.set(address, roles)))
    });
  }

  ngOnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }


  setToList(set: Set<string>): string[] {
    const list: string[] = [];
    set.forEach(value => list.push(value));
    return list;
  }
}
