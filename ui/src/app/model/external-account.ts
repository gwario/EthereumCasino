import {AddressTokensEther} from "./address-tokens-ether";

export class ExternalAccount extends AddressTokensEther {

  public static ROLE_CASINO_TOKEN_OWNER: string     = "CASINO_TOKEN_OWNER";
  public static ROLE_CASINO_OWNER: string           = "CASINO_OWNER";
  public static ROLE_CASINO_MANAGER: string         = "CASINO_MANAGER";
  public static ROLE_GAMBLING_HALL_OWNER: string    = "GAMBLING_HALL_OWNER";
  public static ROLE_GAMBLING_HALL_MANAGER: string  = "GAMBLING_HALL_MANAGER";
  public static ROLE_GAME_SUPERVISOR: string        = "GAME_SUPERVISOR";


  roles: Set<string> = new Set<string>();


  hasNoRoles(): boolean {
    return this.roles.size == 0;
  }

  isCasinoTokenOwner(): boolean {
    return this.roles.has(ExternalAccount.ROLE_CASINO_TOKEN_OWNER)
  }

  isCasinoOwner(): boolean {
    return this.roles.has(ExternalAccount.ROLE_CASINO_OWNER)
  }

  isCasinoManager(): boolean {
    return this.roles.has(ExternalAccount.ROLE_CASINO_MANAGER)
  }

  isGamblingHallOwner(): boolean {
    return this.roles.has(ExternalAccount.ROLE_GAMBLING_HALL_OWNER)
  }

  isGamblingHallManager(): boolean {
    return this.roles.has(ExternalAccount.ROLE_GAMBLING_HALL_MANAGER)
  }

  isSlotmachineSupervisor(): boolean {
    return this.roles.has(ExternalAccount.ROLE_GAME_SUPERVISOR)
  }
}
