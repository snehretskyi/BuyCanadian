"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
// app.component.ts
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
let AppComponent = class AppComponent {
    constructor(ref) {
        this.ref = ref;
        this.title = 'Buy Canadian 🇨🇦';
        this.theme = 'light';
        const darkModeOn = window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        // If dark mode is enabled then directly switch to the dark-theme
        if (darkModeOn) {
            this.theme = "dark";
            document.documentElement.setAttribute('data-bs-theme', this.theme);
        }
        // Watch for changes of the preference
        window.matchMedia("(prefers-color-scheme: dark)").addListener(e => {
            const turnOn = e.matches;
            this.theme = turnOn ? "dark" : "light";
            document.documentElement.setAttribute('data-bs-theme', this.theme);
            // Trigger refresh of UI
            this.ref.tick();
        });
    }
};
AppComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-root',
        templateUrl: './app.component.html',
        standalone: true,
        imports: [
            router_1.RouterOutlet
        ],
        styleUrls: ['./app.component.css']
    })
], AppComponent);
exports.AppComponent = AppComponent;
