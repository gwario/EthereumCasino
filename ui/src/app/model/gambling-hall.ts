import {Game} from "./game";
import {AddressTokensEther} from "./address-tokens-ether";

export class GamblingHall extends AddressTokensEther {

  name: string;
  ownerAddress: string;
  managerAddress: string;
  casinoAddress: string;
  nameGameInfo: Map<string, Game>;
}
