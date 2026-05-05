import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { PrinterService } from 'src/app/services/printer.service';
import * as QRCode from 'qrcode';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-potvrda',
  templateUrl: './potvrda.page.html',
  styleUrls: ['./potvrda.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PotvrdaPage implements OnInit {
  currentPage: string = 'potvrda';
  menuOpen = false;
  data: any;
  devices: any[] = [];
  selectedPrinter: string = '';
  paymentType: string = 'gotovina';

  constructor(
    private router: Router,
    private računService: RačunService,
    private printerService: PrinterService,
    private bluetooth: BluetoothSerial,
    private androidPermissions: AndroidPermissions,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.menuOpen = false;
    console.log('PAGE 3 INIT DATA:', this.računService.getData());
    this.data = this.računService.getData();
    console.log("Data: ", this.data);
    await this.requestBluetoothPermissions();
    this.selectedPrinter = this.printerService.getPrinter();
    console.log('Selected printer:', this.selectedPrinter);
    this.loadDevices();
  }

  async requestBluetoothPermissions() {
  try {
    const result = await this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
      this.androidPermissions.PERMISSION.BLUETOOTH_SCAN
    ]);

    console.log('Permissions result:', result);
  } catch (err) {
    console.error('Permission error:', err);
  }
}

loadDevices() {
  this.bluetooth.list().then(devices => {
    this.devices = devices;

    console.log('Paired devices:', devices);

    const saved = this.printerService.getPrinter();

    if (saved) {
      this.selectedPrinter = saved;
    }
  }).catch(err => {
    console.error('Device load error:', err);
  });
}
  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

get totalPassengers(): number {
  const odrasli = Number(this.data?.odrasli || 0);
  const djeca = Number(this.data?.djeca || 0);
  const bebe = Number(this.data?.bebe || 0);

  return odrasli + djeca + bebe;
}

savePrinter() {
  this.printerService.setPrinter(this.selectedPrinter);
  this.cdr.detectChanges();
}

async generateQR(text: string) {
  return await QRCode.toDataURL(text);
}

async onPay() {
  const data = this.računService.getData();

  const response = await this.createOrder(data);

  if (!response || response.response !== 'Success') {
    console.error('Order failed', response);
    return;
  }

  // ✅ CORRECT VALUES FROM API
  data.qrCode = response.code;
  data.ticketNumber = response.order;

  console.log('QR CODE:', data.qrCode);
  console.log('TICKET NUMBER:', data.ticketNumber);

  const printer = this.selectedPrinter;

  await this.printerService.printReceipt(printer, data);

  await this.saveToServer(data);

  console.log('Printed');

  this.računService.addBooking({
    datum: this.formatDate(data.datum),
    vrijeme: data.vrijeme,
    total: Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)
  });
}

async createOrder(data: any): Promise<any> {
  try {
    const total = data.cijena;
    const isPaid = data.orderMode === 'karta';

    const payload = {
      startdate: this.formatDate(data.datum),
      starttime: this.mapTimeToId(data.vrijeme),

      payment: isPaid ? total : 0,
      numberkids: Number(data.djeca),
      numberteens: 0,
      numberadults: Number(data.odrasli),

      totalprice: total,

      status: isPaid ? 2 : 1,
      payment_type: isPaid ? data.paymentType : null
    };

    console.log('ORDER PAYLOAD:', payload);

    const res: any = await firstValueFrom(
      this.http.post(
        'https://tickets.semisubmarine-pakostane.com/api/orders.php',
        payload
      )
    );

    console.log('RAW RESPONSE:', res);

    const response = Array.isArray(res) ? res[0] : res;

    return response;

  } catch (err) {
    console.error('Order error:', err);
    return null;
  }
}

mapTimeToId(time: string): number {
  const productTimes = this.računService.productTimesCache;

  if (!productTimes || productTimes.length === 0) {
    console.warn('ProductTimes not loaded yet!');
    return 0;
  }

  const match = productTimes.find(t =>
    time.includes(t.title)
  );

  return match ? match.id : 0;
}

formatDate(date: string): string {
  return date.split('T')[0]; // "2026-04-30"
}

async saveToServer(data: any) {
  const payload = {
    date: this.formatDate(data.datum)
  };

  try {
    const res = await firstValueFrom(
      this.http.post(
        'https://tickets.semisubmarine-pakostane.com/api/schedule.php',
        payload
      )
    );

    console.log('Schedule updated:', res);
    console.log('Sending payload:', payload);

  } catch (err) {
    console.error('Save error', err);
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
