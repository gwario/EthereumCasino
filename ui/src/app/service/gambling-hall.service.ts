import {Injectable} from '@angular/core';
import * as TruffleContract from '../../../node_modules/truffle-contract';
import {HttpProvider} from "web3/types";
import Web3 from "web3";
import {environment} from "../../environments/environment";

declare let require: any;
declare let window: any;

const gamblingHallAbi = require('../../../../dapp/build/contracts/SimpleGamblingHall.json');

@Injectable({
  providedIn: 'root'
})
export class GamblingHallService {
  private web3Provider: HttpProvider;
  private gamblingHallContract: TruffleContract;

  constructor() {
    const  gamblingHallContract = TruffleContract(gamblingHallAbi);

    //new version
    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }

    gamblingHallContract.setProvider(this.web3Provider);
    this.fix(gamblingHallContract);//without netmask, we need this

    this.gamblingHallContract = gamblingHallContract;

    window.web3 = new Web3(this.web3Provider);
  }

  getAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return resolve(instance.address);
      }).catch(function(error) {
        return reject("Error in getAddress service call: "+error);
      });
    });
  }

  getName(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.name.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        return reject("Error in getName service call: "+error);
      });
    });
  }

  getCasinoAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.casino.call();
      }).then(function(casino) {
        return resolve(casino);
      }).catch(function(error){
        return reject("Error in getOwnerAddress service call: "+error);
      });
    });
  }

  getOwnerAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.owner.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        return reject("Error in getOwnerAddress service call: "+error);
      });
    });
  }

  getManagerAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.manager.call();
      }).then(function(manager) {
        return resolve(manager);
      }).catch(function(error){
        return reject("Error in getManagerAddress service call: "+error);
      });
    });
  }

  getGameNames(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.getGameNames();
      }).then(function(games) {
        return resolve(games);
      }).catch(function(error){
        return reject("Error in getGameType service call: "+error);
      });
    });
  }

  getGameAddress(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.getGameAddress(name);
      }).then(function(address) {
        return resolve(address);
      }).catch(function(error){
        return reject("Error in getGameAddress service call: "+error);
      });
    });
  }

  getGameType(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gamblingHallContract.deployed().then(function(instance) {
        return instance.getGameType(name);
      }).then(function(type) {
        return resolve(window.web3.utils.hexToUtf8(type));
      }).catch(function(error){
        return reject("Error in getGameType service call: "+error);
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
