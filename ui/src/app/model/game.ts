import {GamblingHall} from "./gambling-hall";
import {AddressTokensEther} from "./address-tokens-ether";

export class Game extends AddressTokensEther {

  name: string;
  type: string;
  superviser: Account;
  gamblingHall: GamblingHall;
  available: boolean;
}
