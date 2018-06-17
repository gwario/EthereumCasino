import { Component } from '@angular/core';
import {CasinoService} from "./service/casino.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  casinoOwner: string;
  casinoAddress: string;

  constructor(private casino: CasinoService) {
    casino.getCasinoOwner().then(value => {
      this.casinoOwner = value;
    });

    casino.getCasinoAddress().then(value => {
      this.casinoAddress = value;
    });
  }
}

