import {Injectable} from '@angular/core';
import BigNumber from "bignumber.js";
import {CasinoTokenService} from "./casino-token.service";
import {Web3Service} from "./web3.service";


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

    return new Promise<BigNumber>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.prize().call()
        .then(value =>
          resolve(new BigNumber(value)))
        .catch(reason =>
          reject(reason)));
  }

  getPrice(): Promise<BigNumber> {

    return new Promise<BigNumber>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.price().call()
        .then(value =>
          resolve(new BigNumber(value)))
        .catch(reason =>
          reject(reason)));
  }

  setPrize(price: BigNumber, prize: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setPrice(this.web3Service.toBN(price), this.web3Service.toBN(prize)).send({from: from});
  }

  getDeposit(): Promise<BigNumber> {

    return new Promise<BigNumber>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.deposit().call()
        .then(value =>
          resolve(new BigNumber(value)))
        .catch(reason =>
          reject(reason)));
  }

  setDeposit(deposit: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setDeposit(this.web3Service.toBN(deposit)).send({from: from});
  }

  getPossibilities(): Promise<BigNumber> {

    return new Promise<BigNumber>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.possibilities().call()
        .then(value =>
          resolve(new BigNumber(value)))
        .catch(reason =>
          reject(reason)));
  }

  setPossibilities(possibilities: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setPossibilities(this.web3Service.toBN(possibilities)).send({from: from});
  }

  getTargetBlockOffset(): Promise<BigNumber> {

    return new Promise<BigNumber>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.targetBlockOffset().call()
        .then(value =>
          resolve(new BigNumber(value)))
        .catch(reason =>
          reject(reason)));
  }

  setTargetBlockOffset(targetBlockOffset: BigNumber, from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.setTargetBlockOffset(this.web3Service.toBN(targetBlockOffset)).send({from: from});
  }

  hold(from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.hold().send({from: from});
  }

  release(from: string): void {
    this.web3Service.allOrNothingSlotmachineContract.methods.release().send({from: from});
  }

  DATA_PULL_THE_LEVER(): Promise<string> {

    return new Promise<string>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.DATA_PULL_THE_LEVER().call()
        .then(value =>
          resolve(this.web3Service.hexToUtf8(value)))
        .catch(reason =>
          reject(reason)));
  }

  DATA_CLAIM(): Promise<string> {

    return new Promise<string>((resolve, reject) =>

      this.web3Service.allOrNothingSlotmachineContract.methods.DATA_CLAIM().call()
      .then(value =>
        resolve(this.web3Service.hexToUtf8(value)))
      .catch(reason =>
        reject(reason)));
  }


  pullTheLever(from: string): Promise<boolean> {

    return this.getPrice().then(price => {

      console.log("price", typeof price, price.toString());
      return this.getDeposit().then(deposit => {

        console.log("deposit", typeof deposit, deposit.toString());
        return this.DATA_PULL_THE_LEVER().then(data => {

          console.log("transferring tokens for pull the lever", "data", data, typeof data, "price.plus(deposit)", price.plus(deposit).toString());
          return this.casinoTokenService.transfer(this.getAddress(), price.plus(deposit), data, from);
        });
      });
    });
  }

  claim(from: string): Promise<boolean> {

    return this.DATA_CLAIM().then(data => {

      console.log("transferring 0 tokens for claim '"+data+"'("+typeof data+")");
      return this.casinoTokenService.transfer(this.getAddress(), new BigNumber(0), data, from);
    });
  }
}
