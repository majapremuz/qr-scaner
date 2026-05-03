import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RačunService {

  bookings: any[] = [];
  productTimesCache: any[] = [];

  constructor(private http: HttpClient) { }

  data: any = {
    polaznaTocka: '',
    vrstaVoznje: '',
    datum: '',
    odrasli: 0,
    djeca: 0,
    bebe: 0,
    vrijeme: '',
    cijena: '',
    ime: '',
    prezime: '',
    telefon: '',
    email: '',
    poruka: '',
    paymentType: '' 
  };

  setData(newData: any) {
    this.data = { ...this.data, ...newData };
  }

  getData() {
    return this.data;
  }

  getSchedule(date: string) {
  return this.http.post<any[]>(
    'https://tickets.semisubmarine-pakostane.com/api/schedule.php',
    { date }
  );
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

getPrices() {
  return this.http.get<any[]>(
    'https://tickets.semisubmarine-pakostane.com/api/prices.php'
  );
}

getProductTimes() {
  return this.http.get<any[]>(
    'https://tickets.semisubmarine-pakostane.com/api/producttimes.php'
  );
}

getPassengersByDateAndTime(date: string, time: string): number {
console.log("Bookings:", this.bookings)
  return this.bookings
    .filter(b => b.datum === date && b.vrijeme === time)
    .reduce((sum, b) => sum + (Number(b.total) || 0), 0) || 0;
}
}
