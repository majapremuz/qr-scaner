import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RačunService {

  bookings: any[] = [];

  data: any = {
    polaznaTocka: '',
    datum: '',
    odrasli: 0,
    djeca: 0,
    bebe: 0,
    vrijeme: '',
    ime: '',
    prezime: '',
    telefon: '',
    email: '',
    poruka: ''
  };

  setData(newData: any) {
    this.data = { ...this.data, ...newData };
  }

  getData() {
    return this.data;
  }

  clear() {
    this.data = {};
  }

  addBooking(booking: any) {
  this.bookings.push({
    datum: booking.datum,
    vrijeme: booking.vrijeme,
    total: Number(booking.total)
  });
}

getPassengersByDateAndTime(date: string, time: string): number {
console.log("Bookings:", this.bookings)
  return this.bookings
    .filter(b => b.datum === date && b.vrijeme === time)
    .reduce((sum, b) => sum + (Number(b.total) || 0), 0) || 0;
}
}
