import { Injectable } from '@angular/core';
import Web3 from "web3";
import {HttpProvider} from "web3/types";
import TruffleContract from 'truffle-contract';

declare let require: any;
declare let window: any;

let casinoAbi = require('../../../../dapp/build/contracts/Casino.json');

@Injectable({
  providedIn: 'root'
})
export class CasinoService {
  private web3Provider: HttpProvider;
  private casinoContract: TruffleContract;

  constructor() {
    this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    let casinoContract = TruffleContract(casinoAbi);
    casinoContract.setProvider(this.web3Provider);
    this.casinoContract = this.fix(casinoContract);

    window.web3 = new Web3(this.web3Provider);
  }

  getAccountInfo() {
    return new Promise((resolve, reject) => {
      window.web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          window.web3.eth.getBalance(account, function(err, balance) {
            if(err === null) {
              return resolve({fromAccount: account, balance:window.web3.fromWei(balance, "ether")});
            } else {
              return reject("error!");
            }
          });
        }
      });
    });
  }

  getCasinoAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed()
        .then(function(instance) {
          console.log(instance);
          return resolve(instance.address);
        })
        .catch(function(error) {
          console.log(error);
          return reject("Casino not deployed!");
        });
      });
  }

  getCasinoName(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        console.log(instance);
        return instance.name.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        console.log(error);
        return reject("Error in getCasinoOwner service call");
      });
    });
  }

  getOwner(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        console.log(instance);
        return instance.owner.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        console.log(error);
        return reject("Error in getCasinoOwner service call");
      });
    });
  }

  private fix(contract: TruffleContract): TruffleContract {
    //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof contract.currentProvider.sendAsync !== "function") {
      contract.currentProvider.sendAsync = function() {
        return contract.currentProvider.send.apply(
          contract.currentProvider, arguments
        );
      };
    }
    return contract;
  }
}
