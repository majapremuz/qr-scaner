import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { PrinterService } from 'src/app/services/printer.service';
import * as QRCode from 'qrcode';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { v4 as uuidv4 } from 'uuid'; 
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

  constructor(
    private router: Router,
    private računService: RačunService,
    private printerService: PrinterService,
    private bluetooth: BluetoothSerial,
    private androidPermissions: AndroidPermissions,
    private http: HttpClient
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
}

async generateQR(text: string) {
  return await QRCode.toDataURL(text);
}

async onPay() {
  const data = this.računService.getData();

  const ticketId = uuidv4(); // unique QR content
  data.qrCode = ticketId;

  await this.saveToServer(data);

  const printer = this.selectedPrinter;

  this.printerService.printReceipt(printer, data)
    .then(() => console.log('Printed'))
    .catch(err => console.error(err));

  // Save booking
  this.računService.addBooking({
    datum: this.formatDate(data.datum),
    vrijeme: data.vrijeme,
    total: Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)
  });
}

formatDate(date: string): string {
  return date.split('T')[0]; // "2026-04-30"
}

async saveToServer(data: any) {
  try {
    await firstValueFrom(
      this.http.post('https://your-api/save-ticket.php', data)
    );
  } catch (err) {
    console.error('Save error', err);
  }
}

  navHome() {
    this.router.navigate(['/home']);
  }

  navInfo() {
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    this.router.navigate(['/potvrda']);
  }

  navIzdavanje() {
    this.router.navigate(['/kapetan']);
  }

  navScanner() {
    this.router.navigate(['/scanner']);
  }

}
