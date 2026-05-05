import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  prices: any[] = [];
  productTimes: any[] = [];
  productTypes: any[] = [];
  orderMode: 'karta' | 'rezervacija' = 'karta';
  paymentType: 'gotovina' | 'kartica' | null = null;

  constructor(
    private router: Router,
    private računService: RačunService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
  console.log('PAGE 2 INIT DATA:', this.računService.getData());
  await this.loadAllData();
}

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

async loadAllData() {
  const [prices, times, types] = await Promise.all([
    firstValueFrom(this.računService.getPrices()),
    firstValueFrom(this.računService.getProductTimes()),
    firstValueFrom(this.računService.getProductTypes())
  ]);

  this.prices = prices;
  this.productTypes = types;

  this.productTimes = times
    .sort((a: any, b: any) => this.parseTime(a.title) - this.parseTime(b.title))
    .map((t: any) => ({
      ...t,
      calculatedPrice: this.calculatePrice(t)
    }));
    this.računService.productTimesCache = times;
  console.log('FINAL TIMES:', this.productTimes);
  this.cdr.detectChanges(); 
}

calculatePrice(t: any): number {
  if (!t.producttypes) return 0; 
  const data = this.računService.getData();

  const odrasli = Number(data.odrasli || 0);
  const djeca = Number(data.djeca || 0);
  const bebe = Number(data.bebe || 0);

  const priceItem = this.prices.find(p => p.type === t.producttypes);

  if (!priceItem) {
    console.warn('No price match for:', t);
    return 0;
  }

  return (
    odrasli * priceItem.priceadult +
    djeca * priceItem.priceteen +
    bebe * priceItem.pricebaby
  );
}
parseTime(time: string): number {
  // normalize: "9" → "09:00", "14" → "14:00"
  if (!time.includes(':')) {
    time = time.padStart(2, '0') + ':00';
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes; // total minutes
}

getTypeTitle(typeId: number): string {
  const type = this.productTypes.find(t => t.id === typeId);
  return type ? type.title : '';
}

get selectedPrice(): number {
  const data = this.računService.getData();

  const isRiva = true;

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

getTypeName(typeId: number): string {
  const type = this.productTypes.find(t => t.id === typeId);
  return type ? type.title : '';
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
    paymentType: this.orderMode === 'karta' ? this.paymentType : 'rezervacija',
    orderMode: this.orderMode
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
