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
    datum: '',
    odrasli: 0,
    djeca: 0,
    bebe: 0,
    vrijeme: '',
    cijena: '',
    ime: '',
    paymentType: '',
    orderMode: '' 
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

getProductTypes() {
  return this.http.get<any[]>(
    'https://tickets.semisubmarine-pakostane.com/api/producttypes.php'
  );
}

getPassengersByDateAndTime(date: string, time: string): number {
console.log("Bookings:", this.bookings)
  return this.bookings
    .filter(b => b.datum === date && b.vrijeme === time)
    .reduce((sum, b) => sum + (Number(b.total) || 0), 0) || 0;
}

getOrdersByDateAndTime(date: string, time: string) {
  const timeId = this.mapTimeToId(time);
  

  return this.http.post<any[]>(
    'https://tickets.semisubmarine-pakostane.com/api/ordersbydate.php',
    {
      date: date,
      starttime: timeId
    }
  );
}

mapTimeToId(time: string): number {
  const productTimes = this.productTimesCache;

  if (!productTimes || productTimes.length === 0) {
    console.warn('ProductTimes not loaded yet!');
    return 0;
  }

  const match = productTimes.find(t =>
    time.includes(t.title)
  );

  return match ? match.id : 0;
}

}
