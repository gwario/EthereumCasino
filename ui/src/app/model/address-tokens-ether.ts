import BigNumber from "bignumber.js";

export class AddressTokensEther {

  address: string;
  tokenBalance: BigNumber = new BigNumber(0);
  etherBalance: BigNumber = new BigNumber(0);
}
