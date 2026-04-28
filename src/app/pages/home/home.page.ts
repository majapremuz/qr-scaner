import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  currentPage: string = 'home';
  menuOpen = false;
  selectedDate: string = '';
  isDateModalOpen = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url.includes('one-way-ticket')) {
        this.currentPage = 'one-way-ticket';
      } else if (event.url.includes('return-ticket')) {
        this.currentPage = 'return-ticket';
      } else if (event.url.includes('list')) {
        this.currentPage = 'list';
      } else if (event.url.includes('scanner')) {
        this.currentPage = 'scanner';
      }
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
  }

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

getTodayLocal(): string {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60000);
  return local.toISOString().split('T')[0];
}

minDate = this.getTodayLocal();
maxDate = new Date(new Date().setDate(new Date().getDate() + 30))
  .toISOString()
  .split('T')[0];

onDateChange(event: any) {
  this.selectedDate = event.detail.value;
  this.isDateModalOpen = false;
}

  navOneway() {
    this.router.navigate(['/one-way-ticket']);
  }

  navReturnTicket() {
    this.router.navigate(['/return-ticket']);
  }

  navList() {
    this.router.navigate(['/list']);
  }

  navScanner() {
    this.router.navigate(['/scanner']);
  }

  navlogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

}
