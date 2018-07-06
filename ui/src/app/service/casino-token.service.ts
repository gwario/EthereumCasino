import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {Web3Service} from "./web3.service";
import {AddressTokensEther} from "../model/address-tokens-ether";

@Injectable({
  providedIn: 'root'
})
export class CasinoTokenService {

  constructor(private web3Service: Web3Service) {}


  transfer(to: string, value: BigNumber, data: string, from: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) =>

      this.web3Service.casinoTokenContract.methods['transfer(address,uint256,bytes)'](to, this.web3Service.toBN(value), this.web3Service.utf8ToHex(data))
        .estimateGas({from: from}).then(estimatedGas => {
          console.log("transfer.estimatedGas", estimatedGas);
          this.web3Service.casinoTokenContract.methods['transfer(address,uint256,bytes)'](to, this.web3Service.toBN(value), this.web3Service.utf8ToHex(data))
            .send({from: from, gas: 2*estimatedGas}) // probably the reason for some reverts... just to be sure...
            .then(success => resolve(success))
            .catch(reason => reject(reason));
      }));
  }

  produce(address: string, tokens: BigNumber, from: string): Promise<boolean> {
    return this.web3Service.casinoTokenContract.methods.produce(address, this.web3Service.toBN(tokens)).send({from: from});
  }

  cashout(tokens: BigNumber, from: string) {
    return this.web3Service.casinoTokenContract.methods.cashout(this.web3Service.casinoContract.options.address, this.web3Service.toBN(tokens)).send({from: from});
  }

  getAddress(): string {
    return this.web3Service.casinoTokenContract.options.address;
  }

  getName(): Promise<string> {
    return this.web3Service.casinoTokenContract.methods.name().call();
  }

  getSymbol(): Promise<string> {
    return this.web3Service.casinoTokenContract.methods.symbol().call();
  }

  getDecimals(): Promise<number> {
    return this.web3Service.casinoTokenContract.methods.decimals().call();
  }

  getOwnerAddress(): Promise<string> {
    return this.web3Service.casinoTokenContract.methods.owner().call();
  }

  getTotalSupply(): Promise<string> {
    return this.web3Service.casinoTokenContract.methods.totalSupply().call();
  }

  getTokenBalance(address: string): Promise<BigNumber> {
    return new Promise<BigNumber>(resolve => {
      return this.web3Service.casinoTokenContract.methods.balanceOf(address).call().then(value => {
        resolve(new BigNumber(value));
      });
    });
  }

  getTokensAndEther(address: string): Promise<AddressTokensEther> {
    let tokensAndEther = new AddressTokensEther();
    return new Promise<AddressTokensEther>((resolve, reject) => {
      this.getTokenBalance(address)
        .then(tokenBalance => {
          this.web3Service.getBalance(address).then(balance => {
            tokensAndEther.address = address;
            tokensAndEther.tokenBalance = tokenBalance;
            tokensAndEther.etherBalance = new BigNumber(this.web3Service.fromWei(balance, 'wei'));
            return resolve(tokensAndEther);
          }).catch(reason => reject(reason));
        }).catch(reason => reject(reason));
    });
  }
}
