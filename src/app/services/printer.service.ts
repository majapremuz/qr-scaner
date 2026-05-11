import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import * as QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class PrinterService {
  constructor(private bluetooth: BluetoothSerial) {}

  async printReceipt(address: string, data: any) {

  const receipt = this.generateReceipt(data);

  await new Promise((resolve, reject) => {
    this.bluetooth.connect(address).subscribe(resolve, reject);
  });

  await this.bluetooth.write(receipt);

  await this.bluetooth.disconnect();
}

generateReceipt(data: any): string {
  const ESC = '\x1B';
  const GS = '\x1D';

  let text = '';

  text += ESC + 't' + String.fromCharCode(18);

  text += '====================\n';
  text += '          KARTA\n\n';
  text += '====================\n\n';

  text += `Redni broj: ${data.ticketNumber}\n`;

  text += `Datum: ${this.formatDate(data.datum)}\n`;
  text += `Vrijeme: ${data.vrijeme}:00\n\n`;

  text += `Broj putnika: ${Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)}\n\n`;

  text += `Cijena: ${data.cijena} EUR\n\n`;
  text += `Placanje: ${data.paymentType}\n\n`;

  text += '--------------------\n';

  // QR COMMAND (ESC/POS)
  text += this.generateESCPosQR(data.qrCode);

  text += '\n\nHVALA\n\n';

  text += '--------------------\n';

  text += `www.semisubmarine-pakostane.com\n`;

  return text;
}

generateESCPosQR(data: string): string {
  const GS = '\x1D';

  let qr = '';

  // Model
  qr += GS + '(k' + String.fromCharCode(4, 0, 49, 65, 50, 0);

  // Size
  qr += GS + '(k' + String.fromCharCode(3, 0, 49, 67, 6);

  // Error correction
  qr += GS + '(k' + String.fromCharCode(3, 0, 49, 69, 48);

  // Store data
  const length = data.length + 3;
  const pL = length % 256;
  const pH = Math.floor(length / 256);

  qr += GS + '(k' + String.fromCharCode(pL, pH, 49, 80, 48) + data;

  // Print QR
  qr += GS + '(k' + String.fromCharCode(3, 0, 49, 81, 48);

  return qr;
}

formatDate(date: string): string {
  if (!date) return '';

  if (date.includes('T')) {
    return date.split('T')[0];
  }

  return date;
}

  setPrinter(address: string) {
  localStorage.setItem('printer', address);
}

getPrinter(): string {
  return localStorage.getItem('printer') || '';
}
}
