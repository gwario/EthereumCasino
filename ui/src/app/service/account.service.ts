import {Injectable} from '@angular/core';
import {CasinoService} from "./casino.service";
import {CasinoTokenService} from "./casino-token.service";
import {GamblingHallService} from "./gambling-hall.service";
import {ExternalAccount} from "../model/external-account";
import {SlotmachineService} from "./slotmachine.service";
import {Web3Service} from "./web3.service";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {Observable} from "rxjs/internal/Observable";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  _accountAddresses: Set<string>;

  _accounts: BehaviorSubject<Set<string>>;

  constructor(private web3Service: Web3Service,
              private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private slotmachineService: SlotmachineService) {

    this._accountAddresses = new Set();
    this._accounts = new BehaviorSubject<Set<string>>(this._accountAddresses);

    this.casinoService.getOwnerAddress().then(value => {
      this.add(value);
    });
    this.casinoService.getManagerAddress().then(value => {
      this.add(value);
    });
    this.casinoTokenService.getOwnerAddress().then(value => {
      this.add(value);
    });
    this.gamblingHallService.getOwnerAddress().then(value => {
      this.add(value);
    });
    this.gamblingHallService.getManagerAddress().then(value => {
      this.add(value);
    });
    this.slotmachineService.getSuperviserAddress().then(value => {
      this.add(value);
    });
  }

  public add(address: string): void {
    this._accountAddresses.add(address);
    this._accounts.next(this._accountAddresses);
  }

  public remove(address: string): void {
    this._accountAddresses.delete(address);
    this._accounts.next(this._accountAddresses);
  }

  public has(address: string): boolean {
    return this._accountAddresses.has(address);
  }

  public getExternalAccounts(): Observable<Set<string>> {
    return this._accounts.asObservable();
  }

  public getRoles(address: string): Promise<Set<string>> {

    const roles = new Set();

    return new Promise<Set<string>>((resolve, reject) => {
      //TODO collect this kind of info from events!
      return this.casinoTokenService.getOwnerAddress().then(casinoTokenOwnerAddress => {
        if(address == casinoTokenOwnerAddress)
          roles.add(ExternalAccount.ROLE_CASINO_TOKEN_OWNER);

        return this.casinoService.getOwnerAddress().then(casinoOwnerAddress => {
          if(address == casinoOwnerAddress) {
            roles.add(ExternalAccount.ROLE_CASINO_OWNER);
            roles.add(ExternalAccount.ROLE_CASINO_MANAGER);
          }

          return this.casinoService.getManagerAddress().then(casinoManagerAddress => {
            if(address == casinoManagerAddress)
              roles.add(ExternalAccount.ROLE_CASINO_MANAGER);

            return this.gamblingHallService.getOwnerAddress().then(gamblingHallOwnerAddress => {
              if(address == gamblingHallOwnerAddress) {
                roles.add(ExternalAccount.ROLE_GAMBLING_HALL_OWNER);
                roles.add(ExternalAccount.ROLE_GAMBLING_HALL_MANAGER);
              }

              return this.gamblingHallService.getManagerAddress().then(gamblingHallManagerAddress => {
                if(address == gamblingHallManagerAddress)
                  roles.add(ExternalAccount.ROLE_GAMBLING_HALL_MANAGER);

                return this.slotmachineService.getSuperviserAddress().then(slotmachineSupervisorAddress => {
                  if(address == slotmachineSupervisorAddress)
                    roles.add(ExternalAccount.ROLE_GAME_SUPERVISOR);

                  // console.debug("roles", roles);
                  //TODO add games
                  return resolve(roles);
                });
              });
            });
          });
        });
      });
    });
  }
}
