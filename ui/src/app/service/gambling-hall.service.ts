import {Injectable} from '@angular/core';
import {Web3Service} from "./web3.service";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class GamblingHallService {

  constructor(private web3Service: Web3Service) {}


  getAddress(): string {
    return this.web3Service.gamblingHallContract.options.address;
  }

  getName(): Promise<string> {
    return this.web3Service.gamblingHallContract.methods.name().call();
  }

  getCasinoAddress(): Promise<string> {
    return this.web3Service.gamblingHallContract.methods.casino().call();
  }

  getOwnerAddress(): Promise<string> {
    return this.web3Service.gamblingHallContract.methods.owner().call();
  }

  getManagerAddress(): Promise<string> {
    return this.web3Service.gamblingHallContract.methods.manager().call();
  }

  getGameNames(): Promise<string[]> {
    return this.web3Service.gamblingHallContract.methods.getGameNames().call();
  }

  getGameAddress(name: string): Promise<string> {

    if(this.web3Service.isHex(name))
      return this.web3Service.gamblingHallContract.methods.getGameAddress(name).call();
    else
      return this.web3Service.gamblingHallContract.methods.getGameAddress(this.web3Service.utf8ToHex(name)).call();
  }

  getGameType(name: string): Promise<string> {

    if(this.web3Service.isHex(name))
      return this.web3Service.gamblingHallContract.methods.getGameType(name).call();
    else
      return this.web3Service.gamblingHallContract.methods.getGameType(this.web3Service.utf8ToHex(name)).call();

  }

  addGame(name: string, address: string, from: string) {
    if(this.web3Service.isHex(name))
      return this.web3Service.gamblingHallContract.methods.addGame(name, address).send({from: from, gas: 200000});
    else
      return this.web3Service.gamblingHallContract.methods.addGame(this.web3Service.utf8ToHex(name), address).send({from: from, gas: 200000});
  }

  removeGame(name: string, from: string) {
    if(this.web3Service.isHex(name))
      return this.web3Service.gamblingHallContract.methods.removeGame(name).send({from: from});
    else
      return this.web3Service.gamblingHallContract.methods.removeGame(this.web3Service.utf8ToHex(name)).send({from: from});
  }
}
