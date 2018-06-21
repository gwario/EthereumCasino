import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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


import { AppComponent } from './app.component';
import {CasinoService} from "./service/casino.service";
import {CasinoTokenService} from "./service/casino-token.service";
import { CasinoComponent } from './components/casino/casino.component';
import { AccountComponent } from './components/account/account.component';
import { CasinoTokenComponent } from './components/casino-token/casino-token.component';
import { GamingHallComponent } from './components/gaming-hall/gaming-hall.component';
import { GameComponent } from './components/game/game.component';
import { HasTokensAndEtherComponent } from './components/has-tokens-and-ether/has-tokens-and-ether.component';
import { ProduceTokensComponent } from './dialogs/produce-tokens/produce-tokens.component';
import { StockupEtherComponent } from './dialogs/stockup-ether/stockup-ether.component';
import {AccountService} from "./service/account.service";
import { AccountsComponent } from './components/accounts/accounts.component';
import { BuyComponent } from './dialogs/buy/buy.component';
import { InviteComponent } from './dialogs/invite/invite.component';

@NgModule({
  declarations: [
    AppComponent,
    CasinoComponent,
    AccountComponent,
    CasinoTokenComponent,
    GamingHallComponent,
    GameComponent,
    HasTokensAndEtherComponent,
    ProduceTokensComponent,
    StockupEtherComponent,
    AccountsComponent,
    BuyComponent,
    InviteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule, MatButtonModule, MatTabsModule, MatGridListModule,
    MatSelectModule, MatDividerModule, MatDialogModule
  ],
  providers: [CasinoService, CasinoTokenService, AccountService],
  entryComponents: [ProduceTokensComponent, StockupEtherComponent, BuyComponent, InviteComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
