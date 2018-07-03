import {AddressTokensEther} from "./address-tokens-ether";

export class Game extends AddressTokensEther {

  name: string;
  type: string;
  superviserAddress: string;
  gamblingHallAddress: string;
  available: boolean;
}
