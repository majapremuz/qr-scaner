import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RačunService } from 'src/app/services/račun.service';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InfoPage implements OnInit {
  currentPage: string = 'info';
  menuOpen = false;

  vrijeme: string = '';
  cijena: string = '';
  ime: string = '';
  prezime: string = '';
  telefon: string = '';
  email: string = '';
  poruka: string = '';
  prices: any[] = [];
  productTimes: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private računService: RačunService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('PAGE 2 INIT DATA:', this.računService.getData());
    this.loadPrices();
    this.loadProductTimes();
  }

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

async loadProductTimes() {
  const res: any = await firstValueFrom(
    this.računService.getProductTimes()
  );
  this.productTimes = res.sort((a: any, b: any) => {
  return this.parseTime(a.title) - this.parseTime(b.title);
  });
  this.cdr.detectChanges(); 
  this.računService.productTimesCache = res;
  console.log('Cached productTimes:', this.računService.productTimesCache);
}

parseTime(time: string): number {
  // normalize: "9" → "09:00", "14" → "14:00"
  if (!time.includes(':')) {
    time = time.padStart(2, '0') + ':00';
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes; // total minutes
}

async loadPrices() {
  try {
    const res: any = await firstValueFrom(
      this.računService.getPrices()
    );

    this.prices = res;
    console.log('Prices:', this.prices);
    this.cdr.detectChanges(); 
  } catch (err) {
    console.error(err);
  }
}

getPriceForTime(time: string): number {
  const data = this.računService.getData();

  const isRiva = data.polaznaTocka.includes('Riva');

  // find productTime
  const productTime = this.productTimes.find(t =>
    time.includes(t.title)
  );

  if (!productTime) return 0;

  const productType = productTime.producttypes;

  // find matching price
  const priceItem = this.prices.find(p => {
    if (isRiva) {
      return p.type === productType && p.title.includes('Riva');
    } else {
      return p.type === productType && p.title.includes('Pine');
    }
  });

  if (!priceItem) return 0;

  const odrasli = Number(data.odrasli || 0);
  const djeca = Number(data.djeca || 0);
  const bebe = Number(data.bebe || 0);

  return (
    odrasli * priceItem.priceadult +
    djeca * priceItem.priceteen +
    bebe * priceItem.pricebaby
  );
}

get selectedPrice(): number {
  const data = this.računService.getData();

  const isRiva = data.polaznaTocka.includes('Riva');

  const priceItem = this.prices.find(p =>
    isRiva ? p.type === 1 : p.type === 2
  );

  if (!priceItem) return 0;

  const odrasli = Number(data.odrasli || 0);
  const djeca = Number(data.djeca || 0);
  const bebe = Number(data.bebe || 0);

  return (
    odrasli * priceItem.priceadult +
    djeca * priceItem.priceteen +
    bebe * priceItem.pricebaby
  );
}

  navHome() {
    this.menuOpen = false;
    this.router.navigate(['/home']);
  }

  navInfo() {
    this.menuOpen = false;
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    const newData = {
    vrijeme: this.vrijeme,
    cijena: this.selectedPrice,
    ime: this.ime,
    prezime: this.prezime,
    telefon: this.telefon,
    email: this.email,
    poruka: this.poruka
  };

  console.log('PAGE 2 SAVING:', newData);

  this.računService.setData(newData);
  this.router.navigate(['/potvrda']);
  this.menuOpen = false;
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
