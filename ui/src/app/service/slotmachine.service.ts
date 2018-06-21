import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import * as TruffleContract from '../../../node_modules/truffle-contract';
import {HttpProvider} from "web3/types";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import {CasinoTokenService} from "./casino-token.service";

declare let require: any;
declare let window: any;

const slotmachineAbi = require('../../../../dapp/build/contracts/AllOrNothingSlotmachine.json');

@Injectable({
  providedIn: 'root'
})
export class SlotmachineService {
  private web3Provider: HttpProvider;
  private slotmachineContract: TruffleContract;

  constructor(private casinoTokenService: CasinoTokenService) {

    const slotmachineContract = TruffleContract(slotmachineAbi);

    //new version
    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }

    slotmachineContract.setProvider(this.web3Provider);
    this.fix(slotmachineContract);//without netmask, we need this

    this.slotmachineContract = slotmachineContract;

    window.web3 = new Web3(this.web3Provider);
  }

  getAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return resolve(instance.address);
      }).catch(function(error) {
        return reject("Error in getAddress service call: "+error);
      });
    });
  }

  getName(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.name.call();
      }).then(function(name) {
        return resolve(window.web3.utils.hexToUtf8(name));
      }).catch(function(error){
        return reject("Error in getName service call: "+error);
      });
    });
  }

  getType(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.gameType.call();
      }).then(function(type) {
        return resolve(window.web3.utils.hexToUtf8(type));
      }).catch(function(error){
        return reject("Error in getType service call: "+error);
      });
    });
  }

  getGamblingHallAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.gamblingHall.call();
      }).then(function(gamblingHall) {
        return resolve(gamblingHall);
      }).catch(function(error){
        return reject("Error in getGamblingHallAddress service call: "+error);
      });
    });
  }

  getSuperviserAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.superviser.call();
      }).then(function(superviser) {
        return resolve(superviser);
      }).catch(function(error){
        return reject("Error in getSuperviserAddress service call: "+error);
      });
    });
  }

  isAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.available.call();
      }).then(function(available) {
        return resolve(available);
      }).catch(function(error){
        return reject("Error in isAvailable service call: "+error);
      });
    });
  }

  getPrize(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.prize.call();
      }).then(function(prize) {
        return resolve(new BigNumber(prize));
      }).catch(function(error){
        return reject("Error in getPrize service call: "+error);
      });
    });
  }

  getPrice(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.price.call();
      }).then(function(price) {
        return resolve(new BigNumber(price));
      }).catch(function(error){
        return reject("Error in getPrice service call: "+error);
      });
    });
  }

  setPrize(price: BigNumber, prize: BigNumber, from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.setPrice(price.toNumber(), prize.toNumber(), {from: from});
    }).catch(function(error){
      console.error("Error in setPrice service call: "+error);
    });
  }

  getDeposit(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.deposit.call();
      }).then(function(deposit) {
        return resolve(new BigNumber(deposit));
      }).catch(function(error){
        return reject("Error in getDeposit service call: "+error);
      });
    });
  }

  setDeposit(deposit: BigNumber, from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.setDeposit(deposit.toNumber(), {from: from});
    }).catch(function(error){
      console.error("Error in setDeposit service call: "+error);
    });
  }

  getPossibilities(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.possibilities.call();
      }).then(function(possibilities) {
        return resolve(new BigNumber(possibilities));
      }).catch(function(error){
        return reject("Error in getPossibilities service call: "+error);
      });
    });
  }

  setPossibilities(possibilities: BigNumber, from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.setPossibilities(possibilities.toNumber(), {from: from});
    }).catch(function(error){
      console.error("Error in setPossibilities service call: "+error);
    });
  }

  getTargetBlockOffset(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.slotmachineContract.deployed().then(function(instance) {
        return instance.targetBlockOffset.call();
      }).then(function(targetBlockOffset) {
        return resolve(new BigNumber(targetBlockOffset));//window.web3.utils.hex
      }).catch(function(error){
        return reject("Error in getTargetBlockOffset service call: "+error);
      });
    });
  }

  setTargetBlockOffset(targetBlockOffset: BigNumber, from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.setTargetBlockOffset(targetBlockOffset.toNumber(), {from: from});
    }).catch(function(error){
      console.error("Error in setTargetBlockOffset service call: "+error);
    });
  }

  hold(from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.hold({from: from});
    }).catch(function(error){
      console.error("Error in hold service call: "+error);
    });
  }

  release(from: string): void {
    this.slotmachineContract.deployed().then(function(instance) {
      instance.release({from: from});
    }).catch(function(error){
      console.error("Error in release service call: "+error);
    });
  }

  private DATA_PULL_THE_LEVER: string = "pullTheLever";
  private DATA_CLAIM: string = "claim";

  pullTheLever(from: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
    return this.getAddress().then(address => {
    return this.getPrice().then(price => {
    return this.getDeposit().then(deposit => {
      return this.casinoTokenService.transfer(address, price.plus(deposit), this.DATA_PULL_THE_LEVER, from).then(value => resolve(value));
    });
    });
    }).catch(error => {
      console.error("Error in pullTheLever service call: "+error);
    });
    });
  }

  claim(from: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      return this.getAddress().then(address => {
        return this.casinoTokenService.transfer(address, new BigNumber(0), this.DATA_CLAIM, from)
          .then(value => resolve(value))
          .catch(reason => {
            console.log(reason);
            return reject(reason);
          });
      }).catch(error => {
        console.error("Error in claim service call: "+error);
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
