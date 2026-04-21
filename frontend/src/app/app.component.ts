import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    main { min-height: 100vh; }
  `],
})
export class AppComponent {}
