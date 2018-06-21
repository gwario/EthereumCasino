import {Casino} from "./casino";
import {Game} from "./game";
import {AddressTokensEther} from "./address-tokens-ether";
import {ExternalAccount} from "./external-account";

export class GamblingHall extends AddressTokensEther {

  name: string;
  owner: ExternalAccount;
  manager: ExternalAccount;
  casino: Casino;
  nameGameInfo: Map<string, Game>;
}
