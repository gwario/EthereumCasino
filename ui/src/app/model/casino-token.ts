import {ExternalAccount} from "./external-account";
import {AddressTokensEther} from "./address-tokens-ether";

export class CasinoToken extends AddressTokensEther {

  name: string;
  symbol: string;
  decimals: number;
  owner: ExternalAccount = new ExternalAccount();
}
