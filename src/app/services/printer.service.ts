import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PrinterService {

  constructor(private bluetooth: BluetoothSerial, private authService: AuthService) {}

  async printReceipt(address: string, data: any) {

  await new Promise((resolve, reject) => {
    this.bluetooth.connect(address)
      .subscribe(resolve, reject);
  });

  const ticket = this.generateTicket(data);
  await this.bluetooth.write(new TextEncoder().encode(ticket));

  if (Number(data.status) === 2) {

    const fiscal = this.generateFiscalReceipt(data);

    await this.bluetooth.write(
      new TextEncoder().encode(fiscal)
    );
  }

  await this.bluetooth.disconnect();
}

generateTicket(data: any): string {
  const ESC = '\x1B';
  const GS = '\x1D';

  const paymentText =
  data.paymentType === 'cash'
    ? 'Gotovina'
    : 'Kartica';

  let text = '';

  text += ESC + 't' + String.fromCharCode(18);

  text += '====================\n';
  text += '          KARTA\n\n';
  text += '====================\n\n';

  text += `Redni broj: ${data.ticketNumber}\n`;

  text += `Datum: ${this.formatDate(data.datum)}\n`;
  text += `Vrijeme: ${data.vrijeme}:00\n\n`;

  text += `Naziv: ${data.ime}\n`;
  text += `E-mail: ${data.email}\n`;
  text += `Broj putnika: ${Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)}\n\n`;

  text += `Cijena: ${data.cijena} EUR\n\n`;
  text += `Placanje: ${paymentText}\n\n`;

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

generateFiscalReceipt(data: any): string {

  const paymentText =
  data.paymentType === 'cash'
    ? 'Gotovina'
    : 'Kartica';

  const fiscalUrl =
  `https://porezna.gov.hr/rn?jir=${data.JIR}` +
  `&datv=${this.formatDate(data.datum)}` +
  `&izn=${data.cijena}`;

  let text = '';

  text += 'PLAVA LAGUNA D.O.O.\n';
  text += 'FRANE PETRIČA 10C, ZADAR\n\n';
  text += 'OIB: 33848595948\n';
  text += 'RIVA PAKOŠTANE\n'
  text += 'Riva u Pakoštanima\n'

  text += '====================\n';
  text += '        Račun br. ' + data.invoice_number + '\n';
  text +=                `${this.formatDate(data.datum)} ${data.vrijeme}:00\n\n`;
  text += '====================\n\n';
 
  text += 'Naziv:\n';
  text +=   'Količina        PDV%\n';
  text +=   'Cijena          Iznos\n';

  text += '--------------------\n\n\n';

  if (Number(data.odrasli) > 0) {
  const totalAdult =
    Number(data.odrasli) * Number(data.adultPrice);

 text += `Odrasla karta - ${data.vrstaVoznje}\n`;
 
  text += this.receiptLine(
  `${data.odrasli}`,
  '0'
);

text += this.receiptLine(
  `${data.adultPrice}`,
  `${totalAdult}`
);

text += '\n';
}

if (Number(data.djeca) > 0) {
  const totalChild =
    Number(data.djeca) * Number(data.childPrice);

 text += `Dječja karta - ${data.vrstaVoznje}\n`;
  text += this.receiptLine(
  `${data.djeca}`,
  '0'
);

text += this.receiptLine(
  `${data.childPrice}`,
  `${totalChild}`
);

text += '\n'
}

if (Number(data.bebe) > 0) {
  const totalBaby =
    Number(data.bebe) * Number(data.babyPrice);

  text += `Dječja karta do 2 god - ${data.vrstaVoznje}\n`;
  text += this.receiptLine(
  `${data.bebe}`,
  '0'
);

text += this.receiptLine(
  `${data.babyPrice}`,
  `${totalBaby}`
);

text += '\n'
}

  text += '--------------------\n\n\n';
  text += `Za platiti EUR: ${data.cijena}\n`;
  text += `Način plaćanja: ${paymentText}\n\n`;

  text += '--------------------\n\n';

  text += '*1 PDV nije zaračunat sukladno\n';
  text += 'čl. 90. st. 2. Zakona o PDV-u.\n';

  text += '--------------------\n\n\n';

  text += 'Vrsta poreza        Stopa%\n';
  text +=   'Osnovica          Iznos poreza\n';

  text += '--------------------\n\n\n';

  text += 'Oslobođeno PDV-a\n';
  text += `${data.cijena}       0\n`;

  text += '--------------------\n\n\n';

  text += 'PDV ukupno:\n';
  text +=   `${data.cijena}\n`;

  text += '--------------------\n\n\n';

  text += `Korisnik: ${this.authService.getUsername()}\n`;

  text += `JIR:\n`;
  text += `${data.JIR || ''}\n\n`;

  text += `ZKI:\n`;
  text += `${data.ZKI || ''}\n\n`;

  text += this.generateESCPosQR(fiscalUrl); //https://porezna.gov.hr/rn?jir=${data.JIR}&datv=${data.datum)&izn=%{data.cijena}}
  text += '\n';
  text += 'www.semisubmarine-pakostane.com\n';

  text +=     'Hvala! Thank you!\n';

  text += `Fiskalna blagajna: Neosalon.hr\n`;

  return text;
}

private receiptLine(
  left: string,
  right: string
): string {
  return left.padEnd(20) + right.padStart(10) + '\n';
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
