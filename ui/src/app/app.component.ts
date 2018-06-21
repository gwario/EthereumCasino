import { Component } from '@angular/core';
import {CasinoService} from "./service/casino.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  casinoName: string;

  constructor(private casino: CasinoService) {
    casino.getName().then(value => {
      this.casinoName = value;
    });
  }
}

