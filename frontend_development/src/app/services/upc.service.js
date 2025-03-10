"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpcService = void 0;
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const countryCodes_1 = require("../shared/data/countryCodes");
const UpcNotFoundError_1 = require("../models/errors/UpcNotFoundError");
let UpcService = class UpcService {
    constructor(http) {
        this.http = http;
        this.apiUrl = "https://world.openfoodfacts.org/api/v0/product";
        this.serverApiUrl = "http://localhost:3000/api/scan-barcode";
    }
    getUpcInfo(upc) {
        return this.http.get(`${this.apiUrl}/${upc}.json`).pipe((0, rxjs_1.map)(response => {
            if (response.status === 0) {
                throw new UpcNotFoundError_1.UpcNotFoundError('Product not found!');
            }
            const product = response.product;
            let countryString = (product === null || product === void 0 ? void 0 : product.manufacturing_places) || (product === null || product === void 0 ? void 0 : product.countries_hierarchy) || (product === null || product === void 0 ? void 0 : product.countries) || 'Unknown';
            if (countryString instanceof String && countryString != "Unknown") {
                countryString = countryString.split(',');
            }
            let countriesArray = [];
            // Handle multiple countries and different formats
            if (countryString !== 'Unknown') {
                countriesArray = countryString.map((country) => {
                    let cleaned = country.trim();
                    // Remove language prefix if exists (e.g., "en:Canada" → "Canada")
                    if (cleaned.includes(':')) {
                        cleaned = cleaned.split(':')[1].trim();
                    }
                    return cleaned;
                });
            }
            // Find first country with a valid code
            let primaryCountry = countryString;
            let primaryCountryCode = '';
            // Check if Canada or USA exist in the countries list
            const hasCanada = countriesArray.some(c => c === 'Canada' || c == 'canada' || c == 'ca' || c == 'CA');
            const hasUSA = countriesArray.some(c => c === 'United States' || c === 'USA' || c === 'US' || c == 'us');
            for (const country of countriesArray) {
                const normalizedCountry = country.toLowerCase().replace(/[\s_-]/g, '');
                // using regex
                const matchingCountryKey = Object.keys(countryCodes_1.countryCodes).find(key => key.toLowerCase().replace(/[\s_-]/g, '') === normalizedCountry);
                if (matchingCountryKey) {
                    primaryCountry = matchingCountryKey;
                    primaryCountryCode = countryCodes_1.countryCodes[matchingCountryKey];
                    break;
                }
            }
            return {
                manufacturer: (product === null || product === void 0 ? void 0 : product.brands) || 'Unknown',
                country: primaryCountry,
                countryCode: primaryCountryCode,
                hasCanada: hasCanada,
                hasUSA: hasUSA,
                allCountries: countriesArray.length > 0 ? countriesArray : ['Unknown']
            };
        }));
    }
    uploadAndScanImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post(this.serverApiUrl, formData)
            .pipe((0, rxjs_1.map)(response => response.upc));
    }
};
UpcService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], UpcService);
exports.UpcService = UpcService;
