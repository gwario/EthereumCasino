import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import Web3 from "web3";
import {Contract, HttpProvider} from "web3/types";
import * as TruffleContract from '../../../node_modules/truffle-contract';
import {environment} from "../../environments/environment";

declare let require: any;
declare let window: any;

const casinoTokenAbi = require('../../../../dapp/build/contracts/CasinoToken.json');

@Injectable({
  providedIn: 'root'
})
export class CasinoTokenService {
  private web3Provider: HttpProvider;
  private casinoTokenContract: TruffleContract;
  private otherCasinoTokenContract: Contract;

  constructor() {
    const  casinoTokenContract = TruffleContract(casinoTokenAbi);

    //new version
    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }
    casinoTokenContract.setProvider(this.web3Provider);
    this.fix(casinoTokenContract);//without netmask, we need this

    this.casinoTokenContract = casinoTokenContract;

    window.web3 = new Web3(this.web3Provider);

    this.otherCasinoTokenContract = new window.web3.eth.Contract(casinoTokenAbi.abi, casinoTokenAbi.networks['5777'].address);
    console.log(this.otherCasinoTokenContract)
  }


  transfer(to: string, value: BigNumber, data: string, from: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log("to, value.toNumber(), window.web3.utils.fromUtf8(data),{from: from}", to, value.toNumber(), window.web3.utils.fromUtf8(data), {from: from});
      return this.otherCasinoTokenContract.methods['transfer(address,uint256,bytes)'](to, value.toNumber(), window.web3.utils.fromUtf8(data)).call({from: from}).then(function(result){
        console.log(result);
        return resolve(result);
      });
    });
  }

  produce(address: string, tokens: number, from: string): Promise<boolean> {
    return this.casinoTokenContract.deployed().then(function(instance) {
      return instance.produce(address, tokens, {from: from});
    });
  }

  getAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return resolve(instance.address);
      }).catch(function(error) {
        return reject("Error in getAddress service call");
      });
    });
  }

  getName(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return instance.name.call();
      }).then(function(name) {
        return resolve(name);
      }).catch(function(error){
        return reject("Error in getName service call");
      });
    });
  }

  getSymbol(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return instance.symbol.call();
      }).then(function(symbol) {
        return resolve(symbol);
      }).catch(function(error){
        return reject("Error in getSymbol service call");
      });
    });
  }

  getDecimals(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return instance.decimals.call();
      }).then(function(decimals) {
        return resolve(decimals);
      }).catch(function(error){
        return reject("Error in getDecimals service call");
      });
    });
  }

  getOwnerAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return instance.owner.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        return reject("Error in getOwnerAddress service call");
      });
    });
  }

  getTotalSupply(): Promise<BigNumber> {
    let that = this;
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function(instance) {
        return instance.totalSupply().then(function (totalSupply) {
          return resolve(totalSupply);
        }).catch(function (error) {
          return reject("Error in getTotalSupply service call");
        });
      }).catch(function(error) {
        return reject("Error in getAddress service call");
      });
    });
  }

  getTokenBalance(address: string): Promise<BigNumber> {
    let that = this;
    return new Promise((resolve, reject) => {
      this.casinoTokenContract.deployed().then(function (instance) {
        return instance.balanceOf(address).then(function (tokenBalance) {
          return resolve(tokenBalance);
        }).catch(function(error){
          return reject("Error in getTokenBalance service call");
        });
      }).catch(function (error) {
        return reject("Error in getTokenBalance service call");
      });
    });
  }

  private fix(contract: TruffleContract) {
    //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof contract.currentProvider.sendAsync !== "function") {
      contract.currentProvider.sendAsync = function() {
        return contract.currentProvider.send.apply(
          contract.currentProvider, arguments
        );
      };
    }
  }
}
