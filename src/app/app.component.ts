// app.component.ts
import {ApplicationRef, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

interface UpcResult {
  manufacturer: string;
  country: string;
  countryCode: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Buy Canadian 🇨🇦';
  theme: 'light' | 'dark' = 'light';

  constructor(private ref: ApplicationRef) {
    const darkModeOn =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if(darkModeOn){
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
}
