import {Component, Input, OnInit} from '@angular/core';
import {AddressTokensEther} from "../../model/address-tokens-ether";
import {CasinoTokenService} from "../../service/casino-token.service";

@Component({
  selector: 'app-has-tokens-and-ether',
  templateUrl: './has-tokens-and-ether.component.html',
  styleUrls: ['./has-tokens-and-ether.component.css']
})
export class HasTokensAndEtherComponent implements OnInit {

  @Input() tokensAndEther: AddressTokensEther;

  tokenSymbol: string;

  constructor(private casinoTokenService: CasinoTokenService) {
    this.casinoTokenService.getSymbol().then(value => {
      this.tokenSymbol = value;
    })
  }

  ngOnInit() {
  }

}
