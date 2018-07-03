import BigNumber from "bignumber.js";
import {AddressTokensEther} from "./address-tokens-ether";

export class Casino extends AddressTokensEther {

  name: string;
  ownerAddress: string;
  managerAddress: string;
  tokenAddress: string;
  gamblingHallAddress: string;
  opened: boolean;
  tokenPrice: BigNumber = new BigNumber(0);
  exchangeFee: BigNumber = new BigNumber(0);
}
