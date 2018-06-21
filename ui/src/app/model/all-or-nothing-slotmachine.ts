import {Game} from "./game";
import BigNumber from "bignumber.js";

export class AllOrNothingSlotmachine extends Game {

  prize: BigNumber;
  price: BigNumber;
  deposit: BigNumber;
  possibilities: BigNumber;
}
