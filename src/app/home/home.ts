import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly title = signal('Dhairya');
  protected readonly zooming = signal(false);

  constructor(private readonly router: Router) {}

  protected enter(): void {
    if (this.zooming()) {
      return;
    }
    this.zooming.set(true);
    setTimeout(() => this.router.navigateByUrl('/welcome'), 600);
  }
}
