import {CasinoTokenService} from "./service/casino-token.service";
import {AddressTokensEther} from "./model/address-tokens-ether";
import Web3 from "web3";
import BigNumber from "bignumber.js";

export class Utils {

  public static getBalances(address: string, web3: Web3, casinoTokenService: CasinoTokenService): Promise<AddressTokensEther> {
    let tokensAndEther = new AddressTokensEther();
    return new Promise<AddressTokensEther>((resolve, reject) => {
      casinoTokenService.getTokenBalance(address)
        .then(tokenBalance => {
          tokensAndEther.tokenBalance = tokenBalance;

          web3.eth.getBalance(address, null,(error, balance) => {
            if(error) {
              return reject(error);
            } else {
              tokensAndEther.etherBalance = new BigNumber(web3.utils.fromWei(balance, 'ether'));
            }
            return resolve(tokensAndEther);
          });
        }).catch(reason => {
          return reject(reason);
        });
    });
  }
}
