import {AddressTokensEther} from "./address-tokens-ether";
import BigNumber from "bignumber.js";

export class CasinoToken extends AddressTokensEther {

  name: string;
  symbol: string;
  decimals: number;
  ownerAddress: string;
  totalSupply: BigNumber;
}
