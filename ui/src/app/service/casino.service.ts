import {Injectable} from '@angular/core';
import {Web3Service} from "./web3.service";
import BN from "bn.js";

@Injectable({
  providedIn: 'root'
})
export class CasinoService {

  constructor(private web3Service: Web3Service) {}

  //////////////////////////
  buy(value: BN, from: string) {

    console.log("buy", "valueEther: ",value, "from: "+from);

    return this.web3Service.casinoContract.methods.buy().send({
      from: from,
      value: value.toString()
    });
  }

  cashout(exchangeFee: BN, from: string) {

    console.log("cashout", "exchangeFee: "+exchangeFee, "from: "+from);

    return this.web3Service.casinoContract.methods.cashout().send({
      from: from,
      value: exchangeFee.toString()
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
  stockup(valueEther: BN, from: string) {

    console.log("stockup", "valueEther: "+valueEther, "from: "+from);

    return this.web3Service.casinoContract.methods.stockup().send({
      from: from,
      value: valueEther.toString()
    });
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

  ///////////////////////////////
  getTokenPrice(): Promise<BN> {
    return new Promise<BN>(resolve =>
      this.web3Service.casinoContract.methods.tokenPrice().call().then(value =>
        resolve(new BN(value))));
  }
  setTokenPrice(newTokenPrice: BN, from: string) {
    return this.web3Service.casinoContract.methods.setTokenPrice(newTokenPrice).send({from: from});
  }
  ///////////////////////////////
  getExchangeFee(): Promise<BN> {
    return new Promise<BN>(resolve =>
      this.web3Service.casinoContract.methods.exchangeFee().call().then(value =>
        resolve(new BN(value))));
  }
  setExchangeFee(newExchangeFee: BN, from: string) {
    return this.web3Service.casinoContract.methods.setExchangeFee(newExchangeFee).send({from: from});
  }
}
