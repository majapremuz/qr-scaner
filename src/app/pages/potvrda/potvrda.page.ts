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
import { AlertController } from '@ionic/angular';
import { ViewChild, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-potvrda',
  templateUrl: './potvrda.page.html',
  styleUrls: ['./potvrda.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PotvrdaPage implements OnInit {
  @ViewChild('ticketPdf', { static: false }) ticketPdf!: ElementRef;
  qrCodeImage: string = '';
  currentPage: string = 'potvrda';
  menuOpen = false;
  data: any;
  devices: any[] = [];
  selectedPrinter: string = '';
  paymentType: string = 'cash';
  ticketCreated = false;
  showPrinterOptions = false;
  showPdfOptions = false;
  email: string = '';

  constructor(
    private router: Router,
    private računService: RačunService,
    private printerService: PrinterService,
    private bluetooth: BluetoothSerial,
    private androidPermissions: AndroidPermissions,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private emailComposer: EmailComposer
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

async printTicket() {

  const printer = this.selectedPrinter;

  if (!printer) {
    return;
  }

  await this.printerService.printReceipt(printer, this.data);

  console.log('PRINTED');
}

async generateQR(text: string) {
  return await QRCode.toDataURL(text);
}

async onPay() {
  const data = this.računService.getData();

  const full = await this.isBoatFull(data);

  if (full) {

    const alert = await this.alertController.create({
      header: 'Termin popunjen',
      message: 'Nema više slobodnih mjesta za odabrani termin.',
      buttons: ['OK']
    });

    await alert.present();

    return;
  }


  const response = await this.createOrder(data);

  if (!response || response.response !== 'Success') {
    console.error('Order failed', response);
    return;
  }

  data.qrCode = response.code;
  data.ticketNumber = response.order;

  this.qrCodeImage = await this.generateQR(data.qrCode);
  
  await this.saveToServer(data);

  this.računService.addBooking({
    datum: this.formatDate(data.datum),
    vrijeme: data.vrijeme,
    total: Number(data.odrasli) + Number(data.djeca) + Number(data.bebe)
  });

  this.ticketCreated = true;
  console.log('CARD CREATED');

  this.cdr.detectChanges();
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
      payment_type: isPaid ? data.paymentType : null,

      name: data.ime,
      mail: data.email
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
    this.cdr.detectChanges();
    return response;

  } catch (err) {
    console.error('Order error:', err);
    return null;
  }
}

async generatePdfFile(): Promise<string | null> {

  try {

    const element = this.ticketPdf.nativeElement;
    console.log('PDF ELEMENT:', element);

    const canvas = await html2canvas(element);

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 180;

    const imgHeight =
      canvas.height * imgWidth / canvas.width;

    pdf.addImage(
      imgData,
      'JPEG',
      15,
      20,
      imgWidth,
      imgHeight
    );

    const pdfBlob = pdf.output('blob');

    const base64 =
      await this.blobToBase64(pdfBlob);

    const fileName =
      `ticket-${this.data.ticketNumber}.pdf`;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64 as string,
      directory: Directory.Cache
    });

    console.log('PDF SAVED:', savedFile.uri);

    return savedFile.uri;

  } catch (err) {

    console.error('PDF ERROR:', err);

    return null;
  }
}

async downloadPdf() {

  const filePath =
    await this.generatePdfFile();

  if (!filePath) {
    return;
  }

  await Share.share({
    title: 'Karta',
    text: 'Preuzmi kartu',
    url: filePath,
    dialogTitle: 'Preuzmi PDF'
  });
}

async sendPdfEmail() {

  const filePath =
    await this.generatePdfFile();

  if (!filePath) {
    return;
  }

  this.emailComposer.open({
    to: this.email,

    subject: 'Potvrda narudžbe',

    body: 'U privitku se nalazi Vaša karta.',

    attachments: [filePath],

    isHtml: false
  });
}
blobToBase64(blob: Blob): Promise<string> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onerror = reject;

    reader.onload = () => {

      const base64 =
        (reader.result as string).split(',')[1];

      resolve(base64);
    };

    reader.readAsDataURL(blob);

  });
}

async showErrorMessage() {
  const alert = await this.alertController.create({
    header: 'Greška',
    message: 'Došlo je do greške prilikom kreiranja narudžbe.',
    buttons: ['OK']
  });

  await alert.present();
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

async isBoatFull(data: any): Promise<boolean> {

  try {

    const payload = {
      date: this.formatDate(data.datum),
      starttime: this.mapTimeToId(data.vrijeme)
    };

    const res: any = await firstValueFrom(
      this.http.post(
        'https://tickets.semisubmarine-pakostane.com/api/ordersbydate.php',
        payload
      )
    );

    console.log('CURRENT ORDERS:', res);

    const orders = Array.isArray(res) ? res : [];

    // existing passengers
    const currentPassengers = orders.reduce((sum: number, order: any) => {

      return (
        sum +
        Number(order.numberadults || 0) +
        Number(order.numberkids || 0) +
        Number(order.numberteens || 0)
      );

    }, 0);

    // new passengers
    const newPassengers =
      Number(data.odrasli || 0) +
      Number(data.djeca || 0) +
      Number(data.bebe || 0);

    const total = currentPassengers + newPassengers;

    console.log('CURRENT:', currentPassengers);
    console.log('NEW:', newPassengers);
    console.log('TOTAL:', total);

    return total > 12;

  } catch (err) {

    console.error('Capacity check error:', err);

    // safer to block on API failure
    return true;
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
