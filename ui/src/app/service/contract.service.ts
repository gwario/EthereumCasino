import {Injectable} from '@angular/core';
import {GamblingHallService} from "./gambling-hall.service";
import {CasinoTokenService} from "./casino-token.service";
import {CasinoService} from "./casino.service";
import {Web3Service} from "./web3.service";
import {SlotmachineService} from "./slotmachine.service";
import {ContractAccount} from "../model/contract-account";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {Observable} from "rxjs/internal/Observable";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  _addressContract: Map<string, ContractAccount>;

  _contracts: BehaviorSubject<ContractAccount[]>;

  constructor(private web3Service: Web3Service,
              private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private slotmachineService: SlotmachineService) {

    this._addressContract = new Map();
    this._contracts = new BehaviorSubject<ContractAccount[]>([]);

    this.add(casinoService.getAddress());
    this.add(casinoTokenService.getAddress());
    this.add(gamblingHallService.getAddress());
    this.add(slotmachineService.getAddress());
  }

  public add(address: string): void {

    if(!this._addressContract.has(address)) {
      this._addressContract.set(address, new ContractAccount());
      this.update(address);
    }
  }

  public remove(address: string): void {

    this._addressContract.delete(address);
  }

  public has(address: string): boolean {
    return this._addressContract.has(address);
  }

  public getContract(address: string): ContractAccount {
    return this._addressContract.get(address);
  }

  public update(address: string): void {

    this.casinoTokenService.getTokensAndEther(address).then(tokensAndEther => {
      let account = this._addressContract.get(address);
      account = Object.assign(account, tokensAndEther);

      this._contracts.next(Array.from(this._addressContract.values()));

    }).catch(reason => console.error(reason));
  }

  public getContractAccounts(): Observable<ContractAccount[]> {

    return this._contracts.asObservable();
  }
}
