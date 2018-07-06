import {Injectable} from '@angular/core';
import {Web3Service} from "./web3.service";
import BigNumber from "bignumber.js";

@Injectable({
  providedIn: 'root'
})
export class CasinoService {

  constructor(private web3Service: Web3Service) {}

  //////////////////////////
  buyTokens(value: BigNumber, from: string) {

    console.log("buy", "value: ",value, "from: "+from);

    return this.web3Service.casinoContract.methods.buyTokens().send({
      from: from,
      value: value.toNumber()
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
  stockup(value: BigNumber, from: string) {

    console.log("stockup", "valueEther: "+value, "from: "+from);

    return this.web3Service.casinoContract.methods.stockup().send({
      from: from,
      value: value.toString()
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
  getTokenPrice(): Promise<BigNumber> {
    return new Promise<BigNumber>(resolve =>
      this.web3Service.casinoContract.methods.tokenPrice().call().then(value => {
        return resolve(new BigNumber(value));
      })
    );
  }
  setTokenPrice(newTokenPrice: BigNumber, from: string) {
    return this.web3Service.casinoContract.methods.setTokenPrice(this.web3Service.toBN(newTokenPrice)).send({from: from});
  }
  ///////////////////////////////
  getExchangeFee(): Promise<BigNumber> {
    return new Promise<BigNumber>(resolve =>
      this.web3Service.casinoContract.methods.exchangeFee().call().then(value =>
        resolve(new BigNumber(value))));
  }
  setExchangeFee(newExchangeFee: BigNumber, from: string) {
    return this.web3Service.casinoContract.methods.setExchangeFee(this.web3Service.toBN(newExchangeFee)).send({from: from});
  }
}
