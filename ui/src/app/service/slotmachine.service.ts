import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {CasinoTokenService} from "./casino-token.service";
import {Web3Service} from "./web3.service";

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

  getPrice(): Promise<BigNumber> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.price().call();
  }

  setPrize(price: BigNumber, prize: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setPrice(price.toNumber(), prize.toNumber()).send({from: from});
  }

  getDeposit(): Promise<BigNumber> {
    return this.web3Service.allOrNothingSlotmachineContract.methods.deposit().call();
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

  private DATA_PULL_THE_LEVER: string = "pullTheLever";
  private DATA_CLAIM: string = "claim";

  pullTheLever(from: string): Promise<boolean> {
    return this.getPrice().then(price => {
      return this.getDeposit().then(deposit => {
        return this.casinoTokenService.transfer(this.getAddress(), price.plus(deposit), this.DATA_PULL_THE_LEVER, from);
      });
    });
  }

  claim(from: string): Promise<boolean> {
    return this.casinoTokenService.transfer(this.getAddress(), new BigNumber(0), this.DATA_CLAIM, from);
  }
}
