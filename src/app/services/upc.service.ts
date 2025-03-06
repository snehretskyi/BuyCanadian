import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UpcItem } from '../models/upc-item';
import {countryCodes} from '../shared/data/countryCodes';

@Injectable({
  providedIn: 'root'
})
export class UpcService {
  private apiUrl = "https://world.openfoodfacts.org/api/v0/product";

  constructor(private http: HttpClient) { }

  getUpcInfo(upc: string): Observable<UpcItem> {
    return this.http.get<any>(`${this.apiUrl}/${upc}.json`).pipe(
      map(response => {
        const product = response.product;
        return {
          manufacturer: product?.brands || 'Unknown',
          country: product?.countries || 'Unknown',
          countryCode: countryCodes[product?.countries] || ''
        } as UpcItem;
      })
    );
  }
}
