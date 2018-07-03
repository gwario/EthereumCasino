import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {Web3Service} from "./web3.service";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class CasinoService {

  constructor(private web3Service: Web3Service) {}

  //////////////////////////
  buy(valueEther: BigNumber, from: string) {

    console.log("buy", "valueEther: "+valueEther, "from: "+from);

    return this.web3Service.casinoContract.methods.buy().send({
      from: from,
      value: window.web3.utils.toWei(valueEther.toString(), 'wei')
    });
  }

  cashout(exchangeFee: BigNumber, from: string) {

    console.log("cashout", "exchangeFee: "+exchangeFee, "from: "+from);

    return this.web3Service.casinoContract.methods.cashout().send({
      from: from,
      value: window.web3.utils.toWei(exchangeFee.toString(), 'wei')
    });
  }
  ///////////////////////
  open(from: string) {

    console.log("open", "from: "+from);

    return this.web3Service.casinoContract.methods.open().send({from: from});
  }

  close(from: string) {

    console.log("close", "from: "+from);

    return this.web3Service.casinoContract.methods.close().send({from: from});
  }
  //////////////////////////
  payout(from: string) {

    console.log("payout", "from: "+from);

    return this.web3Service.casinoContract.methods.payout().send({from: from});
  }
  stockup(valueEther: BigNumber, from: string) {

    console.log("stockup", "valueEther: "+valueEther, "from: "+from);

    return this.web3Service.casinoContract.methods.stockup().send({from: from, value: window.web3.utils.toWei(valueEther.toString(), 'wei')});
  }
  ///////////////////////////////
  getAddress(): string {
    return this.web3Service.casinoContract.options.address;
  }

  getName(): Promise<string> {
    return this.web3Service.casinoContract.methods.name().call();
  }

  getOwnerAddress(): Promise<string> {
    return this.web3Service.casinoContract.methods.owner().call();
  }

  getManagerAddress(): Promise<string> {
    return this.web3Service.casinoContract.methods.manager().call();
  }

  isOpened(): Promise<boolean> {
    return this.web3Service.casinoContract.methods.opened().call();
  }

  getTokenPrice(): Promise<BigNumber> {
    return this.web3Service.casinoContract.methods.tokenPrice().call();
  }

  getExchangeFee(): Promise<BigNumber> {
    return this.web3Service.casinoContract.methods.exchangeFee().call();
  }

  setExchangeFee(newExchangeFee: BigNumber, from: string) {
    return this.web3Service.casinoContract.methods.setExchangeFee(newExchangeFee).send({from: from});
  }
}
