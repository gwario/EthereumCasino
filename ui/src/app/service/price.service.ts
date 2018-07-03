import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/internal/Observable";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import BigNumber from "bignumber.js";

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  private _eurPerEther: BehaviorSubject<BigNumber>;
  private _eurPerWei: BehaviorSubject<BigNumber>;

  constructor(private http: HttpClient) {

    this._eurPerEther = new BehaviorSubject(new BigNumber(0));
    this._eurPerWei = new BehaviorSubject(new BigNumber(0));

    setInterval(args => {
      this.http.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR')
        .subscribe(value => {
          this._eurPerEther.next(new BigNumber(value['EUR']));
          this._eurPerWei.next(new BigNumber(value['EUR']).dividedBy(1000000000000000000));
        })
    }, 11000);
  }

  eurPerEther(): Observable<BigNumber> {
    return this._eurPerEther.asObservable();
  }
  eurPerWei(): Observable<BigNumber> {
    return this._eurPerWei.asObservable();
  }
}
