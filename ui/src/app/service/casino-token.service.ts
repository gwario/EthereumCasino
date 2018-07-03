import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {Web3Service} from "./web3.service";
import {AddressTokensEther} from "../model/address-tokens-ether";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class CasinoTokenService {

  constructor(private web3Service: Web3Service) {}


  transfer(to: string, value: BigNumber, data: string, from: string): Promise<boolean> {
    return this.web3Service.casinoTokenContract.methods['transfer(address,uint256,bytes)'](to, value.toNumber(), window.web3.utils.fromUtf8(data)).call({from: from});
  }

  produce(address: string, tokens: number, from: string): Promise<boolean> {
    return this.web3Service.casinoTokenContract.methods.produce(address, tokens).call({from: from});
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
            tokensAndEther.tokenBalance = tokenBalance;
            tokensAndEther.etherBalance = new BigNumber(this.web3Service.fromWei(balance, 'wei'));
            return resolve(tokensAndEther);
          }).catch(reason => reject(reason));
        }).catch(reason => reject(reason));
    });
  }
}
