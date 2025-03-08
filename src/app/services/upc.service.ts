import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UpcItem } from '../models/upc-item';
import {countryCodes} from '../shared/data/countryCodes';
import {UpcNotFoundError} from '../models/errors/UpcNotFoundError';

@Injectable({
  providedIn: 'root'
})
export class UpcService {
  private apiUrl = "https://world.openfoodfacts.org/api/v0/product";

  constructor(private http: HttpClient) { }

  getUpcInfo(upc: string): Observable<UpcItem> {
    return this.http.get<any>(`${this.apiUrl}/${upc}.json`).pipe(
      map(response => {
        if (response.status === 0) {
          throw new UpcNotFoundError('Product not found!');
        }

        const product = response.product;
        let countryString = product?.manufacturing_places || product?.countries_hierarchy || product?.countries || 'Unknown';

        if (countryString instanceof String && countryString != "Unknown") {
          countryString = countryString.split(',');
        }
        let countriesArray: string[] = [];

        // Handle multiple countries and different formats
        if (countryString !== 'Unknown') {
          countriesArray = countryString.map((country: string) => {
            let cleaned = country.trim();
            // Remove language prefix if exists (e.g., "en:Canada" → "Canada")
            if (cleaned.includes(':')) {
              cleaned = cleaned.split(':')[1].trim();
            }
            return cleaned;
          });
        }

        // Find first country with a valid code
        let primaryCountry = 'Unknown';
        let primaryCountryCode = '';

        // Check if Canada or USA exist in the countries list
        const hasCanada = countriesArray.some(c => c === 'Canada' || c == 'canada' || c == 'ca' || c == 'CA');
        const hasUSA = countriesArray.some(c =>
          c === 'United States' || c === 'USA' || c === 'US' || c == 'us'
        );

        for (const country of countriesArray) {
          const normalizedCountry = country.toLowerCase().replace(/[\s_-]/g, '');

          // using regex
          const matchingCountryKey = Object.keys(countryCodes).find(key =>
            key.toLowerCase().replace(/[\s_-]/g, '') === normalizedCountry
          );

          if (matchingCountryKey) {
            primaryCountry = matchingCountryKey;
            primaryCountryCode = countryCodes[matchingCountryKey];
            break;
          }
        }

        return {
          manufacturer: product?.brands || 'Unknown',
          country: primaryCountry,
          countryCode: primaryCountryCode,
          hasCanada: hasCanada,
          hasUSA: hasUSA,
          allCountries: countriesArray.length > 0 ? countriesArray : ['Unknown']
        } as UpcItem;
      })
    );
  }
}
