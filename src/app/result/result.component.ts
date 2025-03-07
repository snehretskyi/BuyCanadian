import {Component, Input} from '@angular/core';
import {UpcItem} from '../models/upc-item';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-result',
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './result.component.html',
  standalone: true,
  styleUrl: './result.component.css'
})
export class ResultComponent {
  scanResult: UpcItem | null = null;
  upcCode: string = '';

  constructor(private router:Router) {

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
  onScanAgain(): void {
    // clear localStorage from garbage
    localStorage.removeItem('scanResult');
    localStorage.removeItem('upcCode');

    // navigate back to scan page
    this.router.navigate(['/scan']);
  }

  getCountryEmoji(countryCode: string): string {
    // convert country code to emoji flag
    return String.fromCodePoint(...countryCode
      .toUpperCase()
      .split("")
      // flag emoji a - unicode a (65)
      .map(char => 127397 + char.charCodeAt(0)))
  }
}
