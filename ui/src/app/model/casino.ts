import BigNumber from "bignumber.js";
import {CasinoToken} from "./casino-token";
import {GamblingHall} from "./gambling-hall";
import {AddressTokensEther} from "./address-tokens-ether";
import {ExternalAccount} from "./external-account";

export class Casino extends AddressTokensEther {

  name: string;
  owner: ExternalAccount = new ExternalAccount();
  manager: ExternalAccount = new ExternalAccount();
  token: CasinoToken;
  gamblingHall: GamblingHall;
  opened: boolean;
  tokenPrice: BigNumber;
  exchangeFee: BigNumber;
}
