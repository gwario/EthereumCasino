import {GamblingHall} from "./gambling-hall";
import {AddressTokensEther} from "./address-tokens-ether";
import {ExternalAccount} from "./external-account";

export class Game extends AddressTokensEther {

  name: string;
  type: string;
  superviser: ExternalAccount = new ExternalAccount();
  gamblingHall: GamblingHall;
  available: boolean;
}
