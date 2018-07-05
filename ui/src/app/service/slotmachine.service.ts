import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {CasinoTokenService} from "./casino-token.service";
import {Web3Service} from "./web3.service";
import BN from "bn.js";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class SlotmachineService {

  constructor(private web3Service: Web3Service,
              private casinoTokenService: CasinoTokenService) {}

  getAddress(): string {
    return this.web3Service.allOrNothingSlotmachineContract.options.address;
  }

  getName(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.name().call();
  }

  getType(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.gameType().call();
  }

  getGamblingHallAddress(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.gamblingHall().call();
  }

  getSuperviserAddress(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.superviser().call();
  }

  isAvailable(): Promise<boolean> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.available().call();
  }

  getPrize(): Promise<BigNumber> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.prize().call();
  }

  getPrice(): Promise<BN> {
    return new Promise<BN>(resolve =>
      this.web3Service.allOrNothingSlotmachineContract.methods.price().call().then(value =>
        resolve(new BN(value))));
  }

  setPrize(price: BigNumber, prize: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setPrice(price.toNumber(), prize.toNumber()).send({from: from});
  }

  getDeposit(): Promise<BN> {
    return new Promise<BN>(resolve =>
      this.web3Service.allOrNothingSlotmachineContract.methods.deposit().call().then(value =>
        resolve(new BN(value))));
  }

  setDeposit(deposit: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setDeposit(deposit.toNumber()).send({from: from});
  }

  getPossibilities(): Promise<BigNumber> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.possibilities().call();
  }

  setPossibilities(possibilities: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setPossibilities(possibilities.toNumber()).send({from: from});
  }

  getTargetBlockOffset(): Promise<BigNumber> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.targetBlockOffset().call();
  }

  setTargetBlockOffset(targetBlockOffset: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setTargetBlockOffset(targetBlockOffset.toNumber()).send({from: from});
  }

  hold(from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.hold().send({from: from});
  }

  release(from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.release().send({from: from});
  }

  DATA_PULL_THE_LEVER(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.DATA_PULL_THE_LEVER().call();
  }

  DATA_CLAIM(): Promise<string> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.DATA_CLAIM().call();
  }

  pullTheLever(from: string): Promise<boolean> {
    return this.getPrice().then(price => {
      console.log(typeof price, price)
      return this.getDeposit().then(deposit => {
        console.log(typeof deposit, deposit)
        return this.DATA_PULL_THE_LEVER().then(data => {
          console.log("transferring tokens for pull the lever")
          return this.casinoTokenService.transfer(this.getAddress(), price.add(deposit), data, from);
        });
      });
    });
  }

  claim(from: string): Promise<boolean> {
    return this.DATA_CLAIM().then(data => {
      return this.casinoTokenService.transfer(this.getAddress(), new BN(0), data, from);
    });
  }
}
