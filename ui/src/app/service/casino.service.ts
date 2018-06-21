import {Injectable} from '@angular/core';
import Web3 from "web3";
import {HttpProvider} from "web3/types";
import * as TruffleContract from '../../../node_modules/truffle-contract';
import BigNumber from "bignumber.js";
import {environment} from "../../environments/environment";

declare let require: any;
declare let window: any;

const casinoAbi = require('../../../../dapp/build/contracts/NewVegas.json');


@Injectable({
  providedIn: 'root'
})
export class CasinoService {
  private web3Provider: HttpProvider;
  private casinoContract: TruffleContract;

  constructor() {
    const casinoContract = TruffleContract(casinoAbi);

    //new version
    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }
    casinoContract.setProvider(this.web3Provider);
    this.fix(casinoContract);//without netmask, we need this
    this.casinoContract = casinoContract;

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

  //////////////////////////
  buy(valueEther: BigNumber, from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.buy({
        from: from,
        value: window.web3.utils.toWei(valueEther.toString(), 'ether')
      });
    });
  }
  cashout(exchangeFee: BigNumber, from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.cashout({
        from: from,
        value: window.web3.utils.toWei(exchangeFee.toString(), 'ether')
      });
    });
  }
  ///////////////////////
  open(from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.open({from: from});
    });
  }

  close(from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.close({from: from});
    });
  }
  //////////////////////////
  payout(from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.payout({from: from});
    });
  }
  stockup(valueEther: BigNumber, from: string) {
    return this.casinoContract.deployed().then(function(instance) {
      return instance.stockup({from: from, value: window.web3.utils.toWei(valueEther.toString(), 'ether')});
    });
  }
  ///////////////////////////////
  getAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return resolve(instance.address);
      })
      .catch(function(error) {
        return reject("Error in getAddress service call");
      });
    });
  }

  getName(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.name.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        return reject("Error in getName service call");
      });
    });
  }

  getOwnerAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.owner.call();
      }).then(function(owner) {
        return resolve(owner);
      }).catch(function(error){
        return reject("Error in getOwnerAddress service call");
      });
    });
  }

  getManagerAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.manager.call();
      }).then(function(manager) {
        return resolve(manager);
      }).catch(function(error){
        return reject("Error in getManagerAddress service call");
      });
    });
  }

  isOpened(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.opened.call();
      }).then(function(opened) {
        return resolve(opened);
      }).catch(function(error){
        return reject("Error in isOpened service call");
      });
    });
  }

  getTokenPrice(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.tokenPrice.call();
      }).then(function(tokenPrice) {//FIXME even though its a bignumber, it didn't work
        return resolve(new BigNumber(window.web3.utils.fromWei(tokenPrice.toString(), 'ether')));
      }).catch(function(error){
        return reject("Error in getTokenPrice service call");
      });
    });
  }

  getExchangeFee(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.casinoContract.deployed().then(function(instance) {
        return instance.exchangeFee.call();
      }).then(function(exchangeFee) {//FIXME even though its a bignumber, it didn't work
        return resolve(window.web3.utils.fromWei(exchangeFee.toString(), 'ether'));
      }).catch(function(error){
        return reject("Error in getExchangeFee service call");
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
