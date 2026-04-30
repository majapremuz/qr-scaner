import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { RačunService } from 'src/app/services/račun.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  currentPage: string = 'home';
  menuOpen = false;
  datum: string = '';
  polaznaTocka: string = 'Riva pakoštane';
  odrasli: number = 0;
  djeca: number = 0;
  bebe: number = 0;
  isDateModalOpen = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private računService: RačunService
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
  this.datum = event.detail.value;
  this.isDateModalOpen = false;
}

  navHome() {
    this.računService.setData({
    polaznaTocka: this.polaznaTocka,
    datum: this.datum,
    odrasli: this.odrasli,
    djeca: this.djeca,
    bebe: this.bebe
  });
  this.menuOpen = false;
  this.router.navigate(['/home']);
  }

  navInfo() {
    const newData = {
    polaznaTocka: this.polaznaTocka,
    datum: this.datum,
    odrasli: this.odrasli,
    djeca: this.djeca,
    bebe: this.bebe
  };

  console.log('PAGE 1 DATA:', newData);

  this.računService.setData(newData);
    this.menuOpen = false;
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    const newData = {
    polaznaTocka: this.polaznaTocka,
    datum: this.datum,
    odrasli: this.odrasli,
    djeca: this.djeca,
    bebe: this.bebe
  };

  console.log('PAGE 1 DATA:', newData);

    this.računService.setData(newData);
    this.menuOpen = false;
    this.router.navigate(['/potvrda']);
  }

  navIzdavanje() {
    this.router.navigate(['/kapetan']);
  }

  navScanner() {
    this.router.navigate(['/scanner']);
  }


}
