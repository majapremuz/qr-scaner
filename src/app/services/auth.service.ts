import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isLoggedIn: boolean = false;

  constructor() {
    // Initialize isLoggedIn state from localStorage
    this.isLoggedIn = !!localStorage.getItem('username') && !!localStorage.getItem('password');
  }

  login(username: string, password: string): void {
    this.isLoggedIn = true;
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    console.log('User logged in:', username);
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getPassword(): string | null {
    return localStorage.getItem('password');
  }

  getHashedCredentials(): { hashedUsername: string, hashedPassword: string } | null {
    const username = this.getUsername();
    const password = this.getPassword();

    if (username && password) {
      return {
        hashedUsername: CryptoJS.SHA1(username).toString(),
        hashedPassword: CryptoJS.SHA1(password).toString()
      };
    }

    return null;
  }
}
