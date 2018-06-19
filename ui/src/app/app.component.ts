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
  casinoName: string;

  constructor(private casino: CasinoService) {
    casino.getOwner().then(value => {
      this.casinoOwner = value;
    });

    casino.getAddress().then(value => {
      this.casinoAddress = value;
    });

    casino.getName().then(value => {
      this.casinoName = value;
    });
  }
}

