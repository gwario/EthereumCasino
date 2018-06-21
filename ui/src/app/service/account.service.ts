import {Injectable} from '@angular/core';
import {CasinoService} from "./casino.service";
import {CasinoTokenService} from "./casino-token.service";
import {GamblingHallService} from "./gambling-hall.service";
import {ExternalAccount} from "../model/external-account";
import Web3 from "web3";
import {environment} from "../../environments/environment";
import {HttpProvider} from "web3/types";
import {Utils} from "../utils";
import {ContractAccount} from "../model/contract-account";
import {SlotmachineService} from "./slotmachine.service";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private web3Provider: HttpProvider;

  invitedExternalAccountAddresses: Set<string>;

  constructor(private casinoService: CasinoService,
              private casinoTokenService: CasinoTokenService,
              private gamblingHallService: GamblingHallService,
              private slotmachineService: SlotmachineService) {

    //new version
    if (typeof window.web3 !== 'undefined' && environment.production) {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }
    window.web3 = new Web3(this.web3Provider);

    this.invitedExternalAccountAddresses = new Set();
  }

  invite(address: string) {

    this.invitedExternalAccountAddresses.add(address);
  }

  getExternalAccount(address: string): Promise<ExternalAccount> {
    const externalAccount = new ExternalAccount();

    return new Promise<ExternalAccount>((resolve, reject) => {
      return Utils.getBalances(address, window.web3, this.casinoTokenService).then(tokensAndEther => {
        externalAccount.address = address;
        externalAccount.etherBalance = tokensAndEther.etherBalance;
        externalAccount.tokenBalance = tokensAndEther.tokenBalance;
        return this.getRoles(externalAccount).then(roles => {
          roles.forEach(role => externalAccount.roles.add(role));
          return resolve(externalAccount);
        });
      }).catch(reason => {
        return reject(reason);
      });
    });
  }

  getExternalAccounts(): Promise<Promise<ExternalAccount>[]> {

    return new Promise<Promise<ExternalAccount>[]>((resolve, reject) => {

      const externalAccounts: Promise<ExternalAccount>[] = [];

      this.getExternalAccountAddresses().then(accountAddresses => {

        // console.debug("externalAccountAddresses", accountAddresses);

        accountAddresses.forEach(accountAddress => {

          // console.debug("externalAccountAddress", accountAddress);

          externalAccounts.push(new Promise<ExternalAccount>((resolve, reject) => {

            const externalAccount: ExternalAccount = new ExternalAccount();

            return this.getExternalAccount(accountAddress).then(extAcc => {
              externalAccount.address = extAcc.address;
              externalAccount.etherBalance = extAcc.etherBalance;
              externalAccount.tokenBalance = extAcc.tokenBalance;
              externalAccount.roles = extAcc.roles;

              // console.debug("externalAccount", externalAccount);
              return resolve(externalAccount);
            });
          }));
        });

        // console.debug("externalAccounts", externalAccounts);

        resolve(externalAccounts);
      });
    });
  }

  getContractAccounts(): Promise<ContractAccount>[] {

    const contractAccounts: Promise<ContractAccount>[] = [];

    //casino
    contractAccounts.push(new Promise<ContractAccount>((resolve, reject) => {
      const contractAccount: ContractAccount = new ContractAccount();

      return this.casinoService.getAddress().then(address => {
        return this.casinoService.getName().then(name => {
          return Utils.getBalances(address, window.web3, this.casinoTokenService).then(tokensAndEther => {
            contractAccount.address = address;
            contractAccount.name = name;
            contractAccount.etherBalance = tokensAndEther.etherBalance;
            contractAccount.tokenBalance = tokensAndEther.tokenBalance;
            // console.debug("contractAccount", contractAccount);
            return resolve(contractAccount);
          }).catch(reason => {
            return reject(reason);
          });
        });
      }).catch(reason => {
        return reject(reason);
      });
    }));

    //casino token
    contractAccounts.push(new Promise<ContractAccount>((resolve, reject) => {
      const contractAccount: ContractAccount = new ContractAccount();

      return this.casinoTokenService.getAddress().then(address => {
        return this.casinoTokenService.getName().then(name => {
          return Utils.getBalances(address, window.web3, this.casinoTokenService).then(tokensAndEther => {
            contractAccount.address = address;
            contractAccount.name = name;
            contractAccount.etherBalance = tokensAndEther.etherBalance;
            contractAccount.tokenBalance = tokensAndEther.tokenBalance;
            // console.debug("contractAccount", contractAccount);
            return resolve(contractAccount);
          }).catch(reason => {
            return reject(reason);
          });
        });
      }).catch(reason => {
        return reject(reason);
      });
    }));

    //gambling hall
    contractAccounts.push(new Promise<ContractAccount>((resolve, reject) => {
      const contractAccount: ContractAccount = new ContractAccount();

      return this.gamblingHallService.getAddress().then(address => {
        return this.gamblingHallService.getName().then(name => {
          return Utils.getBalances(address, window.web3, this.casinoTokenService).then(tokensAndEther => {
            contractAccount.address = address;
            contractAccount.name = name;
            contractAccount.etherBalance = tokensAndEther.etherBalance;
            contractAccount.tokenBalance = tokensAndEther.tokenBalance;
            // console.debug("contractAccount", contractAccount);
            return resolve(contractAccount);
          }).catch(reason => {
            return reject(reason);
          });
        });
      }).catch(reason => {
        return reject(reason);
      });
    }));

    contractAccounts.push(new Promise<ContractAccount>((resolve, reject) => {
      const contractAccount: ContractAccount = new ContractAccount();

      return this.slotmachineService.getAddress().then(address => {
        return this.slotmachineService.getName().then(name => {
          return Utils.getBalances(address, window.web3, this.casinoTokenService).then(tokensAndEther => {
            contractAccount.address = address;
            contractAccount.name = name;
            contractAccount.etherBalance = tokensAndEther.etherBalance;
            contractAccount.tokenBalance = tokensAndEther.tokenBalance;
            // console.debug("contractAccount", contractAccount);
            return resolve(contractAccount);
          }).catch(reason => {
            return reject(reason);
          });
        });
      }).catch(reason => {
        return reject(reason);
      });
    }));

    // console.debug("contractAccounts", contractAccounts);
    return contractAccounts;
  }

  getContractAccount(address: string): Promise<ContractAccount> {
      return new Promise<ContractAccount>((resolve, reject) => {

        if(address != '0x0000000000000000000000000000000000000000') {
          this.getContractAccounts().forEach(account => {
            account.then(account => {
              if(account.address == address) {
                return resolve(account);
              }
            }).catch(reason => reject(reason));
          });
        } else {
          return resolve(new ContractAccount());
        }
      });
  }

  private getRoles(externalAccount: ExternalAccount): Promise<Set<string>> {

    const roles = new Set();

    return new Promise<Set<string>>((resolve, reject) => {
      //TODO collect this kind of info from events!
      return this.casinoTokenService.getOwnerAddress().then(casinoTokenOwnerAddress => {
        if(externalAccount.address == casinoTokenOwnerAddress) {
          roles.add(ExternalAccount.ROLE_CASINO_TOKEN_OWNER);
        }

        return this.casinoService.getOwnerAddress().then(casinoOwnerAddress => {
          if(externalAccount.address == casinoOwnerAddress) {
            roles.add(ExternalAccount.ROLE_CASINO_OWNER);
            roles.add(ExternalAccount.ROLE_CASINO_MANAGER);
          }

          return this.casinoService.getManagerAddress().then(casinoManagerAddress => {
            if(externalAccount.address == casinoManagerAddress) {
              roles.add(ExternalAccount.ROLE_CASINO_MANAGER);
            }

            return this.gamblingHallService.getOwnerAddress().then(gamblingHallOwnerAddress => {
              if(externalAccount.address == gamblingHallOwnerAddress) {
                roles.add(ExternalAccount.ROLE_GAMBLING_HALL_OWNER);
                roles.add(ExternalAccount.ROLE_GAMBLING_HALL_MANAGER);
              }

              return this.gamblingHallService.getManagerAddress().then(gamblingHallManagerAddress => {
                if(externalAccount.address == gamblingHallManagerAddress) {
                  roles.add(ExternalAccount.ROLE_GAMBLING_HALL_MANAGER);
                }

                return this.slotmachineService.getSuperviserAddress().then(slotmachineSupervisorAddress => {
                  if(externalAccount.address == slotmachineSupervisorAddress) {
                    roles.add(ExternalAccount.ROLE_GAME_SUPERVISOR);
                  }

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

  private getExternalAccountAddresses(): Promise<Set<string>> {

    const addresses = new Set();

    this.invitedExternalAccountAddresses.forEach(invitedAddress => addresses.add(invitedAddress));

    return new Promise<Set<string>>((resolve, reject) => {

      return this.casinoTokenService.getOwnerAddress().then(casinoTokenOwnerAddress => {

        if(casinoTokenOwnerAddress != '0x0000000000000000000000000000000000000000')
          addresses.add(casinoTokenOwnerAddress);

        return this.casinoService.getOwnerAddress().then(casinoOwnerAddress => {
          if(casinoOwnerAddress != '0x0000000000000000000000000000000000000000')
            addresses.add(casinoOwnerAddress);

          return this.casinoService.getManagerAddress().then(casinoManagerAddress => {
            if(casinoManagerAddress != '0x0000000000000000000000000000000000000000')
              addresses.add(casinoManagerAddress);

            return this.gamblingHallService.getOwnerAddress().then(gamblingHallOwnerAddress => {
              if(gamblingHallOwnerAddress != '0x0000000000000000000000000000000000000000')
                addresses.add(gamblingHallOwnerAddress);

              return this.gamblingHallService.getManagerAddress().then(gamblingHallManagerAddress => {
                if(gamblingHallManagerAddress != '0x0000000000000000000000000000000000000000')
                  addresses.add(gamblingHallManagerAddress);

                return this.slotmachineService.getSuperviserAddress().then(slotmachineSupervisorAddress => {
                  if(slotmachineSupervisorAddress != '0x0000000000000000000000000000000000000000')
                    addresses.add(slotmachineSupervisorAddress);

                  // console.debug("addresses", addresses);
                  //TODO add games
                  return resolve(addresses);
                });
              });
            });
          });
        });
      });
    });
  }
}
