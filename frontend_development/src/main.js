"use strict";
/// <reference types="@angular/localize" />
Object.defineProperty(exports, "__esModule", { value: true });
const platform_browser_1 = require("@angular/platform-browser");
const app_component_1 = require("./app/app.component");
const router_1 = require("@angular/router");
const http_1 = require("@angular/common/http");
const main_page_component_1 = require("./app/main-page/main-page.component");
const result_component_1 = require("./app/result/result.component");
const routes = [
    { path: '', component: main_page_component_1.MainPageComponent },
    { path: 'scan', component: main_page_component_1.MainPageComponent },
    { path: 'result', component: result_component_1.ResultComponent },
    { path: '**', redirectTo: 'scan' }
];
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, {
    providers: [
        (0, http_1.provideHttpClient)(),
        (0, router_1.provideRouter)(routes)
    ]
})
    .catch((err) => console.error(err));
