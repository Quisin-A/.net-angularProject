import { Injectable } from '@angular/core';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userIdKey = 'userId';
  private readonly userRoleKey = 'userRole';
  private readonly userNameKey = 'userName';
  private readonly userEmailKey = 'userEmail'; // ADD THIS

  setSession(user: SessionUser): void {
    localStorage.setItem(this.userIdKey, String(user.id));
    localStorage.setItem(this.userRoleKey, user.role);
    localStorage.setItem(this.userNameKey, user.name);
    localStorage.setItem(this.userEmailKey, user.email); // ADD THIS
  }

  clearSession(): void {
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.userRoleKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.userEmailKey); // ADD THIS
  }

  getUserId(): number | null {
    const value = localStorage.getItem(this.userIdKey);
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  getRole(): string {
    return localStorage.getItem(this.userRoleKey) ?? 'User';
  }

  getUserName(): string {
    return localStorage.getItem(this.userNameKey) ?? '';
  }
  getUserEmail(): string {
    return localStorage.getItem(this.userEmailKey) ?? '';
  }

  isLoggedIn(): boolean {
    return this.getUserId() !== null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
}
