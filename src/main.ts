/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {provideRouter, Routes} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {MainPageComponent} from './app/main-page/main-page.component';
import {ResultComponent} from './app/result/result.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'scan', component: MainPageComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: 'scan' }
]
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));
