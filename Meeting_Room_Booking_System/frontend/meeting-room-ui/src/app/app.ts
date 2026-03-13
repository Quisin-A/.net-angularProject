import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get userRole(): string {
    return this.auth.getRole();
  }

  //
  // New accessors to get Name and Email from AuthService
  get userName(): string {
    return this.auth.getUserName() || 'User';
  }

  get userEmail(): string {
    return this.auth.getUserEmail() || '';
  }


  //
  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }
}


