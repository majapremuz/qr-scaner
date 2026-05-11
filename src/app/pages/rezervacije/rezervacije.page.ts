import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { PrinterService } from 'src/app/services/printer.service';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-rezervacije',
  templateUrl: './rezervacije.page.html',
  styleUrls: ['./rezervacije.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RezervacijePage implements OnInit {
currentPage: string = 'rezervacije';
menuOpen = false;
orders: any[] = [];
date: string = '';
time: string = '';
prices: any[] = [];

constructor(
  private route: ActivatedRoute,
  private racunService: RačunService,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private printerService: PrinterService,
  private http: HttpClient,
  private alertController: AlertController
) {}

async ngOnInit() {
  this.date = this.route.snapshot.queryParams['date'];
  this.time = this.route.snapshot.queryParams['time'];

  console.log('DATE:', this.date);
  console.log('TIME STRING:', this.time);
  console.log('TIME ID:', this.racunService.mapTimeToId(this.time));

  if (!this.racunService.productTimesCache?.length) {
  const res: any = await firstValueFrom(this.racunService.getProductTimes());
  this.racunService.productTimesCache = res;
}

  await this.loadOrders();
}

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

async loadOrders() {
  try {
    const res: any = await firstValueFrom(
      this.racunService.getOrdersByDateAndTime(this.date, this.time)
    );

    console.log('RAW:', res);

    if (!res) {
      this.orders = [];
    }
    else if (Array.isArray(res)) {
      this.orders = res.filter(o => o.response === 'Success');
    }
    else if (res.response === 'Success') {
      this.orders = [res];
    }
    else {
      this.orders = [];
    }

    console.log('Orders:', this.orders);

  } catch (err) {
    console.error(err);
    this.orders = [];
  }

  this.cdr.detectChanges();
}

async reprintTicket(order: any) {

  const productTimes = this.racunService.productTimesCache;

  // find matching time object
  const timeObject = productTimes.find(
    t => t.id == order.starttime
  );

  // actual displayed time
  const vrijeme = timeObject?.title || '';

  // calculate price again
  const priceItem = this.prices.find(
    p => p.type === timeObject?.producttypes
  );

  const totalPrice =
    (Number(order.numberadults) * Number(priceItem?.priceadult || 0)) +
    (Number(order.numberkids) * Number(priceItem?.priceteen || 0));

  const data = {

    qrCode: order.code,

    ticketNumber: order.id,

    datum: order.startdate,

    vrijeme: vrijeme,

    odrasli: order.numberadults,

    djeca: order.numberkids,

    bebe: 0,

    ime: order.name || '',

    cijena: totalPrice,

    paymentType: order.payment_type || 'rezervacija'
  };

  console.log('REPRINT DATA:', data);

  const printer = this.printerService.getPrinter();

  await this.printerService.printReceipt(
    printer,
    data
  );

}

async cancelReservation(order: any) {

  const alert = await this.alertController.create({
    header: 'Potvrda',
    message: 'Jel ste sigurni da želite otkazati rezervaciju?',
    buttons: [
      {
        text: 'Ne',
        role: 'cancel'
      },
      {
        text: 'Da',
        handler: () => {
          this.deleteReservation(order);
          return true;
        }
      }
    ]
  });

  await alert.present();
}

async deleteReservation(order: any) {

  try {

    const payload = {
      qrCode: order.code
    };

    console.log('REMOVE PAYLOAD:', payload);

    const res: any = await firstValueFrom(
      this.http.post(
        'https://tickets.semisubmarine-pakostane.com/api/remove.php',
        payload
      )
    );

    console.log('REMOVE RESPONSE:', res);

    const response = Array.isArray(res)
      ? res[0]
      : res;

    if (response?.response === 'Success') {

      // remove instantly from UI
      this.orders = this.orders.filter(
        o => o.id !== order.id
      );

      // force new array reference
      this.orders = [...this.orders];

      this.cdr.detectChanges();

      // success popup
      const successAlert = await this.alertController.create({
        header: 'Uspjeh',
        message: 'Rezervacija obrisana.',
        buttons: ['OK']
      });

      await successAlert.present();

    }

  } catch (err) {

    console.error('Cancel error:', err);

  }
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
