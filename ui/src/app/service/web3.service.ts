import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import BigNumber from "bignumber.js";
import {WebsocketProvider} from "web3/providers";
import Contract from "web3/eth/contract";

declare let require: any;
declare let window: any;

const Web3 = require("web3");

const casinoTokenAbi  = require('../../../../dapp/build/contracts/CasinoToken.json');
const casinoAbi       = require('../../../../dapp/build/contracts/NewVegas.json');
const gamblingHallAbi = require('../../../../dapp/build/contracts/SimpleGamblingHall.json');
const slotmachineAbi  = require('../../../../dapp/build/contracts/AllOrNothingSlotmachine.json');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3Provider: WebsocketProvider;

  private _eventEmitter = new EventEmitter(true);

  private _casinoTokenContract: Contract;
  private _casinoContract: Contract;
  private _gamblingHallContract: Contract;
  private _allOrNothingSlotmachineContract: Contract;

  constructor() {

    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
    }

    window.web3 = new Web3(this.web3Provider);

    window.web3.eth.net.getId()
      .then(function (network_id) {
        console.log("Web3.eth.net.getId() returned "+network_id+" used one is "+5777);
      });
    let network_id = '5777';
    console.log("Using network id "+network_id);

    this._casinoTokenContract = new window.web3.eth.Contract(casinoTokenAbi.abi, casinoTokenAbi.networks[network_id].address);
    this._casinoContract = new window.web3.eth.Contract(casinoAbi.abi, casinoAbi.networks[network_id].address);
    this._gamblingHallContract = new window.web3.eth.Contract(gamblingHallAbi.abi, gamblingHallAbi.networks[network_id].address);
    this._allOrNothingSlotmachineContract = new window.web3.eth.Contract(slotmachineAbi.abi, slotmachineAbi.networks[network_id].address);

    this._casinoTokenContract.events.allEvents({}, (error, result) => this.events.emit(Web3Service.createEventObject(error, result, "CasinoToken")));
    this._casinoContract.events.allEvents({}, (error, result) => this.events.emit(Web3Service.createEventObject(error, result, "Casino")));
    this._gamblingHallContract.events.allEvents({}, (error, result) => this.events.emit(Web3Service.createEventObject(error, result, "GamblingHall")));
    this._allOrNothingSlotmachineContract.events.allEvents({}, (error, result) => this.events.emit(Web3Service.createEventObject(error, result, "AllOrNothingSlotmachine")));
  }

  private static createEventObject(error: any, event: any, contract: string): any {
    return {
      origin: "web3",
      type: error ? "error": "event",
      contract: contract,
      event: error || event
    }
  }

  public getBalance(address: string): Promise<BigNumber> {
    return new Promise<BigNumber>((resolve) => {
      return window.web3.eth.getBalance(address).then(value => resolve(new BigNumber(value)));
    });
  }

  public fromWei(balance: string | number | BigNumber, unit: string): BigNumber {
    return new BigNumber(window.web3.utils.fromWei(balance.toString(), unit));
  }

  public toWei(balance: string | number | BigNumber, unit: string): BigNumber {
    return new BigNumber(window.web3.utils.toWei(balance.toString(), unit).toString());
  }

  public hexToUtf8(hex: string): string {
    return window.web3.utils.hexToUtf8(hex);
  }

  public isHex(string: string): boolean {
    return window.web3.utils.isHex(string);
  }

  public utf8ToHex(string: string): string {
    return window.web3.utils.fromUtf8(string);
  }

  toBN(number: BigNumber | string): any {
    return window.web3.utils.toBN(number);
  }

  get events(): EventEmitter<any> {
    return this._eventEmitter;
  }

  get casinoTokenContract(): Contract {
    return this._casinoTokenContract;
  }
  get casinoContract(): Contract {
    return this._casinoContract;
  }
  get gamblingHallContract(): Contract {
    return this._gamblingHallContract;
  }
  get allOrNothingSlotmachineContract(): Contract {
    return this._allOrNothingSlotmachineContract;
  }
  // set bar(theBar:boolean) {
  //   this._bar = theBar;
  // }
}
