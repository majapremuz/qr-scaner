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
  email: string = '';
  prices: any[] = [];
  productTimes: any[] = [];
  productTypes: any[] = [];
  orderMode: 'karta' | 'rezervacija' | null = null; 
  paymentType: 'gotovina' | 'kartica' | null = null;  
  sirenTimes: string[] = [];
  isMermaidShow = false;
  MAX_SEATS = 12;

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

  const data = this.računService.getData();

  const [prices, times, types, sirenTimes] =
    await Promise.all([

      firstValueFrom(this.računService.getPrices()),

      firstValueFrom(this.računService.getProductTimes()),

      firstValueFrom(this.računService.getProductTypes()),

      firstValueFrom(this.računService.getSirenTimes())
    ]);

  this.prices = prices;

  this.productTypes = types;

  // ["09:00", "10:00", ...]
  this.sirenTimes = sirenTimes.map(
    (s: any) => s.time.slice(0, 5)
  );

  const isSunday =
    this.isSunday(data.datum);

  this.productTimes = await Promise.all(

    times
      .sort((a: any, b: any) =>
        this.parseTime(a.title) -
        this.parseTime(b.title)
      )
      .map(async (t: any) => {

        let normalizedTime = t.title;

        if (!normalizedTime.includes(':')) {

          normalizedTime =
            normalizedTime.padStart(2, '0') +
            ':00';
        }

        // MON-SAT + sirena time
        const useSirenaPrice =
          !isSunday &&
          this.sirenTimes.includes(normalizedTime);

        const updatedTime = {

          ...t,

          producttypes:
            useSirenaPrice ? 2 : 1
        };

        return {

          ...updatedTime,

          calculatedPrice:
            this.calculatePrice(updatedTime),

          availableSeats:
            await this.getAvailableSeats(updatedTime)
        };
      })
  );

  this.računService.productTimesCache =
    this.productTimes;

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

isPastTime(time: string): boolean {
  const data = this.računService.getData();

  // selected date from previous page
  const selectedDate = data.datum?.split('T')[0];

  // today's date
  const today = new Date();
  const todayString =
    today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  // only block times for TODAY
  if (selectedDate !== todayString) {
    return false;
  }

  // normalize time
  let normalized = time;

  if (!normalized.includes(':')) {
    normalized = normalized.padStart(2, '0') + ':00';
  }

  const [hours, minutes] = normalized.split(':').map(Number);

  const nowMinutes =
    today.getHours() * 60 + today.getMinutes();

  const timeMinutes =
    hours * 60 + minutes;

  return timeMinutes <= nowMinutes;
}

isSunday(date: string): boolean {
  return new Date(date).getDay() === 0;
}

async getAvailableSeats(time: any): Promise<number> {

  try {

    const data = this.računService.getData();

    const res: any = await firstValueFrom(
      this.računService.getOrdersByDateAndTime(
        this.formatDate(data.datum),
        this.normalizeTime(time.title)
      )
    );

    console.log('CHECKING TIME:', this.normalizeTime(time.title));
    console.log('DATE:', data.datum);

    const orders = Array.isArray(res)
      ? res
      : [res];

    const bookedSeats = orders.reduce(
      (sum: number, order: any) => {

        return (
          sum +
          Number(order.numberadults || 0) +
          Number(order.numberkids || 0) +
          Number(order.numberteens || 0)
        );

      },
      0
    );

    this.cdr.detectChanges();
    return this.MAX_SEATS - bookedSeats;
  } catch (err) {
    console.error('Seat check error:', err);
    return this.MAX_SEATS;
  }
}

normalizeTime(time: string): string {

  // 9 -> 09:00:00
  if (!time.includes(':')) {
    return time.padStart(2, '0') + ':00:00';
  }

  // 09:00 -> 09:00:00
  if (time.length === 5) {
    return time + ':00';
  }

  return time;
}


formatDate(date: string): string {

  if (!date) return '';

  return date.split('T')[0];
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
    email: this.email,
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
