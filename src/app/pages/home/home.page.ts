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
import { firstValueFrom } from 'rxjs';


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
    this.loadLocations();
    this.loadTypes();
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

async loadLocations() {
  try {
    const res: any = await firstValueFrom(
      this.http.get('https://tickets.semisubmarine-pakostane.com/api/prices.php')
    );

    this.prices = res;

    // Extract unique locations
    const locationsSet = new Set<string>();

    res.forEach((item: any) => {
      if (item.type === 1) {
        locationsSet.add('Riva');
      } else if (item.type === 2) {
        locationsSet.add('Pine Beach');
      }
    });

    this.locations = Array.from(locationsSet);
    this.cdr.detectChanges(); 

    // Set default
    if (this.locations.length > 0) {
      this.polaznaTocka = this.locations[0];
    }

    console.log('Locations:', this.locations);

  } catch (err) {
    console.error(err);
  }
}

async loadTypes() {
  try {
    const res: any = await firstValueFrom(
      this.http.get('https://tickets.semisubmarine-pakostane.com/api/producttypes.php')
    );

    this.types = res;
    this.cdr.detectChanges();

    // default selection
    if (this.types.length > 0) {
      this.vrstaVoznje = this.types[0].id;
    }

    console.log('Types:', this.types);

  } catch (err) {
    console.error(err);
  }
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
