import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { App } from '@capacitor/app';

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
  pojedinačnaCijena: string = '';
  vrstaVoznje: string = '';
  ime: string = '';
  email: string = '';
  prices: any[] = [];
  productTimes: any[] = [];
  productTypes: any[] = [];
  pricelists: any[] = [];
  orderMode: 'karta' | 'rezervacija' | null = null; 
  paymentType: 'gotovina' | 'kartica' | null = null;  
  sirenTimes: string[] = [];
  isMermaidShow = false;
  MAX_SEATS = 12;

  constructor(
    private router: Router,
    private računService: RačunService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  async ngOnInit() {
  console.log('PAGE 2 INIT DATA:', this.računService.getData());
  await this.loadAllData();
}

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

isFormValid(): boolean {

  if (!this.vrijeme) {
    return false;
  }

  if (!this.ime?.trim()) {
    return false;
  }

  if (!this.email?.trim()) {
    return false;
  }

  if (!this.orderMode) {
    return false;
  }

  if (
    this.orderMode === 'karta' &&
    !this.paymentType
  ) {
    return false;
  }
  return true;
}

async loadAllData() {

  const data = this.računService.getData();

  const [prices, times, types, sirenTimes, pricelists] =
    await Promise.all([
      firstValueFrom(this.računService.getPrices()),
      firstValueFrom(this.računService.getProductTimes()),
      firstValueFrom(this.računService.getProductTypes()),
      firstValueFrom(this.računService.getSirenTimes()),
      firstValueFrom(this.računService.getPricelists())
    ]);

  this.prices = prices;
  this.productTypes = types;
  this.pricelists = pricelists;

  const selectedDateStr = this.formatDate(data.datum);
  const [year, month, day] = selectedDateStr
  .split('-')
  .map(Number);

const selectedDate = new Date(year, month - 1, day);
  const isSunday = selectedDate.getDay() === 0;

  // normalize siren times once
  const normalizedSirenTimes = sirenTimes.map((s: any) =>
    this.normalizeTime(s.time).slice(0, 5)
  );

  // find active pricelist (IMPORTANT FIX: safe parsing)
  const activePricelist = this.pricelists.find((p: any) => {
    if (!p.startdate || !p.enddate) return false;

    const [startYear, startMonth, startDay] =
  p.startdate.split('-').map(Number);

const [endYear, endMonth, endDay] =
  p.enddate.split('-').map(Number);

const start =
  new Date(startYear, startMonth - 1, startDay);

const end =
  new Date(endYear, endMonth - 1, endDay);

    return selectedDate >= start && selectedDate <= end;
  });

  const isSeason = this.pricelists.some((p: any) => {

  // ONLY real season
  if (Number(p.category) !== 2) {
    return false;
  }

  if (!p.startdate || !p.enddate) {
    return false;
  }

  const [startYear, startMonth, startDay] =
    p.startdate.split('-').map(Number);

  const [endYear, endMonth, endDay] =
    p.enddate.split('-').map(Number);

  const start =
    new Date(startYear, startMonth - 1, startDay);

  const end =
    new Date(endYear, endMonth - 1, endDay);

  return (
    selectedDate >= start &&
    selectedDate <= end
  );
});

  this.productTimes = await Promise.all(
    times
      .sort((a: any, b: any) =>
        this.parseTime(a.title) - this.parseTime(b.title)
      )
      .map(async (t: any) => {

        const timeKey = this.normalizeTime(t.title).slice(0, 5);

        const isSirenaTime =
          !isSunday &&
          isSeason &&
          normalizedSirenTimes.includes(timeKey);

          console.log('SIREN DEBUG', {
            selectedDate,
            isSunday,
            isSeason,
            normalizedSirenTimes,
            times: times.map(t => this.normalizeTime(t.title).slice(0,5))
          });

          console.log('TIME CHECK', {
          time: t.title,
          timeKey,
          sirens: normalizedSirenTimes,
          match: normalizedSirenTimes.includes(timeKey)
        });

        const updatedTime = {
          ...t,
          producttypes: isSirenaTime ? 2 : t.producttypes,
        };
          console.log('producttypE:', t.producttypes)


        return {
          ...updatedTime,
          calculatedPrice: this.calculatePrice(updatedTime),
          availableSeats: await this.getAvailableSeats(updatedTime)
        };
      })
  );

  this.računService.productTimesCache = this.productTimes;

  console.log('FINAL TIMES:', this.productTimes);

  this.cdr.detectChanges();
}

getPriceItem(t: any): any {

  const data = this.računService.getData();
  const selected = this.formatDate(data.datum);

  const activePricelist = this.pricelists.find((p: any) => {

    if (!p.startdate || !p.enddate) {
      return false;
    }

    const start = p.startdate.slice(0, 10);
    const end = p.enddate.slice(0, 10);

    return selected >= start && selected <= end;
  });

  if (!activePricelist) {
    return null;
  }

  return this.prices.find((p: any) =>
    Number(p.pricelist) === Number(activePricelist.id) &&
    Number(p.type) === Number(t.producttypes)
  );
}

calculatePrice(t: any): number {

  const data = this.računService.getData();

  const odrasli = Number(data.odrasli || 0);
  const djeca = Number(data.djeca || 0);
  const bebe = Number(data.bebe || 0);

  const selected = this.formatDate(data.datum);

    const activePricelist = this.pricelists.find((p: any) => {

      if (!p.startdate || !p.enddate) return false;

      const start = p.startdate.slice(0, 10);
      const end = p.enddate.slice(0, 10);

      return selected >= start && selected <= end;
    });

    console.log('ACTIVE PRICELIST:', activePricelist);
    console.log('SELECTED DATE:', selected);

  if (!activePricelist) {
    console.warn('No active pricelist');
    return 0;
  }

  
  // find matching price
  const priceItem = this.prices.find((p: any) =>
  Number(p.pricelist) === Number(activePricelist.id) &&
  Number(p.type) === Number(t.producttypes)
);

  console.log('LOOKUP:', {
  pricelist: activePricelist?.id,
  type: t.producttypes,
  prices: this.prices
});

console.log('PRICE ITEM:', priceItem);

  if (!priceItem) {

    console.warn('No matching price:', {
      pricelist: activePricelist.id,
      type: t.producttypes
    });

    return 0;
  }

  return (
    odrasli * Number(priceItem.priceadult) +
    djeca * Number(priceItem.priceteen) +
    bebe * Number(priceItem.pricebaby)
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

/*isSeason(date: string): boolean {

  const selectedDate =
    new Date(this.formatDate(date));

  const seasonPricelist =
    this.pricelists.find(
      p => p.category === 2
    );

  if (
    !seasonPricelist?.startdate ||
    !seasonPricelist?.enddate
  ) {
    return false;
  }

  const start =
    new Date(seasonPricelist.startdate);

  const end =
    new Date(seasonPricelist.enddate);

  return (
    selectedDate >= start &&
    selectedDate <= end
  );
}*/

toDateOnly(date: string | Date): number {
  return new Date(date).setHours(0, 0, 0, 0);
}

async getAvailableSeats(time: any): Promise<number> {

  try {

    const data = this.računService.getData();

    const date =
      this.formatDate(data.datum);

    const res: any = await firstValueFrom(
      this.računService.getSchedule(date)
    );

    const normalizedSelectedTime =
      this.normalizeTime(time.title);

    const matchingRow = res.find((r: any) => {

      return (
        this.normalizeTime(r.time) ===
        normalizedSelectedTime
      );

    });

    if (!matchingRow) {
      return this.MAX_SEATS;
    }

    // IMPORTANT:
    // adjust field name depending on API response

    const bookedSeats =
      Number(matchingRow.total || 0);

    console.log('AVAILABLE SEATS:', this.MAX_SEATS - bookedSeats);

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

  if (!this.isFormValid()) {
    return;
  }

  const selectedTime = this.productTimes.find(
    t => t.title === this.vrijeme
  );

  const priceItem =
    this.getPriceItem(selectedTime);

  const vrstaVoznje =
    this.getTypeTitle(selectedTime.producttypes);

  const newData = {

    vrijeme: this.vrijeme,

    cijena: selectedTime.calculatedPrice,

    adultPrice: priceItem?.priceadult || 0,
    childPrice: priceItem?.priceteen || 0,
    babyPrice: priceItem?.pricebaby || 0,

    vrstaVoznje: vrstaVoznje,

    ime: this.ime,
    email: this.email,

    paymentType:
      this.orderMode === 'karta'
        ? this.paymentType
        : 'rezervacija',

    orderMode: this.orderMode
  };

  console.log('PAGE 2 SAVING:', newData);

  this.računService.setData(newData);

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

  logout() {
    this.authService.logout();
    App.exitApp();
  }

}
