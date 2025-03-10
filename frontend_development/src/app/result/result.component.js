"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
let ResultComponent = class ResultComponent {
    constructor(router) {
        this.router = router;
        this.scanResult = null;
        this.upcCode = '';
    }
    ngOnInit() {
        const result = localStorage.getItem('scanResult');
        const upcCode = localStorage.getItem('upcCode');
        if (result) {
            this.scanResult = JSON.parse(result);
        }
        if (upcCode) {
            this.upcCode = upcCode;
        }
        if (!this.scanResult || !this.upcCode) {
            this.router.navigate(['/scan']);
        }
    }
    // perhaps i could use routerlink
    // but what's the fun without challenge
    onScanAgain() {
        // clear localStorage from garbage
        localStorage.removeItem('scanResult');
        localStorage.removeItem('upcCode');
        // navigate back to scan page
        this.router.navigate(['/scan']);
    }
    getCountryEmoji(countryCode) {
        // convert country code to emoji flag
        return String.fromCodePoint(...countryCode
            .toUpperCase()
            .split("")
            // flag emoji a - unicode a (65)
            .map(char => 127397 + char.charCodeAt(0)));
    }
};
ResultComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-result',
        imports: [
            common_1.NgIf
        ],
        templateUrl: './result.component.html',
        standalone: true,
        styleUrl: './result.component.css'
    })
], ResultComponent);
exports.ResultComponent = ResultComponent;
