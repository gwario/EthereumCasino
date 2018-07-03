import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

import {AppComponent} from './app.component';
import {CasinoService} from "./service/casino.service";
import {CasinoTokenService} from "./service/casino-token.service";
import {CasinoComponent} from './components/casino/casino.component';
import {AccountComponent} from './components/account/account.component';
import {CasinoTokenComponent} from './components/casino-token/casino-token.component';
import {GamblingHallComponent} from './components/gambling-hall/gambling-hall.component';
import {Slotmachine10GameComponent} from './components/game/slotmachine-1-0-game.component';
import {BalancesComponent} from './components/balances/balances.component';
import {ProduceTokensComponent} from './dialogs/produce-tokens/produce-tokens.component';
import {StockupEtherComponent} from './dialogs/stockup-ether/stockup-ether.component';
import {AccountService} from "./service/account.service";
import {AccountsComponent} from './components/accounts/accounts.component';
import {BuyComponent} from './dialogs/buy/buy.component';
import {InviteComponent} from './dialogs/invite/invite.component';
import {SlotmachineService} from "./service/slotmachine.service";
import {GamblingHallService} from "./service/gambling-hall.service";
import {PlaySlotmachineGameComponent} from './dialogs/play-slotmachine-game/play-slotmachine-game.component';
import {FormsModule} from '@angular/forms';
import {ContractService} from "./service/contract.service";
import {ChangeExchangeFeeComponent} from './dialogs/change-exchange-fee/change-exchange-fee.component';

@NgModule({
  declarations: [
    AppComponent,
    CasinoComponent,
    AccountComponent,
    CasinoTokenComponent,
    GamblingHallComponent,
    Slotmachine10GameComponent,
    BalancesComponent,
    ProduceTokensComponent,
    StockupEtherComponent,
    AccountsComponent,
    BuyComponent,
    InviteComponent,
    PlaySlotmachineGameComponent,
    ChangeExchangeFeeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule, MatButtonModule, MatTabsModule,
    MatGridListModule, MatSelectModule, MatDividerModule, MatDialogModule, MatSnackBarModule, FormsModule,
    MatTooltipModule
  ],
  providers: [
    CasinoService, CasinoTokenService, AccountService, ContractService, SlotmachineService, GamblingHallService
  ],
  entryComponents: [
    ProduceTokensComponent, StockupEtherComponent, BuyComponent, InviteComponent, PlaySlotmachineGameComponent,
    ChangeExchangeFeeComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
