import {Component, OnInit} from '@angular/core';
import {CasinoTokenService} from "../../service/casino-token.service";
import {CasinoToken} from "../../model/casino-token";
import {AccountService} from "../../service/account.service";
import {CasinoService} from "../../service/casino.service";

declare let window: any;

@Component({
  selector: 'app-casino-token',
  templateUrl: './casino-token.component.html',
  styleUrls: ['./casino-token.component.css']
})
export class CasinoTokenComponent implements OnInit {

  casinoToken: CasinoToken;

  constructor(private casinoTokenService: CasinoTokenService,
              private casinoService: CasinoService,
              private accountService: AccountService) {
    this.casinoToken = new CasinoToken();

    casinoTokenService.getAddress().then(address => {
      accountService.getContractAccount(address).then(account => {
        this.casinoToken.address = account.address;
        this.casinoToken.tokenBalance = account.tokenBalance;
        this.casinoToken.etherBalance = account.etherBalance;
      }).catch(reason => console.error("accountService.getContractAccount(this.casinoToken.address/"+this.casinoToken.address+")", reason));
    });
    casinoTokenService.getName().then(value => {
      this.casinoToken.name = value;
    });
    casinoTokenService.getSymbol().then(value => {
      this.casinoToken.symbol = value;
    });
    casinoTokenService.getDecimals().then(value => {
      this.casinoToken.decimals = value;
    });
    casinoTokenService.getOwnerAddress().then(address => {
      accountService.getExternalAccount(address).then(externalAccount => {
        this.casinoToken.owner = externalAccount;
      }).catch(reason => console.error("accountService.getExternalAccount(this.casinoToken.owner.address/"+this.casinoToken.owner.address+")", reason));
    });
  }

  ngOnInit() {
  }

}
