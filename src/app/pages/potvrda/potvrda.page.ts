import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { PrinterService } from 'src/app/services/printer.service';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-potvrda',
  templateUrl: './potvrda.page.html',
  styleUrls: ['./potvrda.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PotvrdaPage implements OnInit {
  currentPage: string = 'potvrda';
  menuOpen = false;
  data: any;
  PRINTER_MAC_ADDRESS = 'XX:XX:XX:XX:XX:XX';

  constructor(
    private router: Router,
    private računService: RačunService,
    private printerService: PrinterService,
    private bluetooth: BluetoothSerial
  ) { }

  ngOnInit() {
    this.menuOpen = false;
    console.log('PAGE 3 INIT DATA:', this.računService.getData());
    this.data = this.računService.getData();
    console.log("Data: ", this.data);
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

async generateQR(text: string) {
  return await QRCode.toDataURL(text);
}

onPay() {
  const data = this.računService.getData();

  this.printerService.printReceipt(this.PRINTER_MAC_ADDRESS, data)
    .then(() => {
      console.log('Printed successfully');
    })
    .catch(err => {
      console.error('Print error:', err);
    });

    this.računService.addBooking({
    datum: this.formatDate(data.datum),
    vrijeme: data.vrijeme,
    total: Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)
  });
}

formatDate(date: string): string {
  return date.split('T')[0]; // "2026-04-30"
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
