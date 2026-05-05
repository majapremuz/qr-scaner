import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { RačunService } from 'src/app/services/račun.service';
import { HttpClient } from '@angular/common/http';


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
  locations: string[] = [];
  prices: any[] = [];
  types: any[] = [];
  vrstaVoznje: any = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private računService: RačunService,
    private http: HttpClient
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url.includes('home')) {
        this.currentPage = 'home';
      } else if (event.url.includes('info')) {
        this.currentPage = 'info';
      } else if (event.url.includes('potvrda')) {
        this.currentPage = 'potvrda';
      } else if (event.url.includes('kapetan')) {
        this.currentPage = 'kapetan';
      } else if (event.url.includes('pomjena-rezervacije')) {
        this.currentPage = 'promjena-rezervacije';
      } else if (event.url.includes('scanner')) {
        this.currentPage = 'scanner';
      }
    });
  }

  ngOnInit() {}

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
    bebe: this.bebe,
    vrstaVoznje: this.vrstaVoznje
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
    bebe: this.bebe,
    vrstaVoznje: this.vrstaVoznje
  };

  console.log('PAGE 1 DATA:', newData);

  this.računService.setData(newData);
    this.menuOpen = false;
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    const newData = {
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

  navList() {
    this.menuOpen = false;
    this.router.navigate(['/kapetan']);
  }

  navChange() {
    this.menuOpen = false;
    this.router.navigate(['/promjena-rezervacije']);
  }

  navScanner() {
    this.menuOpen = false;
    this.router.navigate(['/scanner']);
  }


}
