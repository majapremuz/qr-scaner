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
import { ViewChild, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { Share } from '@capacitor/share';
import * as QRCode from 'qrcode';


@Component({
  selector: 'app-rezervacije',
  templateUrl: './rezervacije.page.html',
  styleUrls: ['./rezervacije.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RezervacijePage implements OnInit {
@ViewChild('ticketPdf', { static: false }) ticketPdf!: ElementRef;
currentPage: string = 'rezervacije';
menuOpen = false;
orders: any[] = [];
date: string = '';
time: string = '';
prices: any[] = [];
ticketCreated = false;
showPrinterOptions = false;
showPdfOptions = false;
email: string = '';
selectedTicket: any = null;
qrCodeImage: string = '';

constructor(
  private route: ActivatedRoute,
  private racunService: RačunService,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private printerService: PrinterService,
  private http: HttpClient,
  private alertController: AlertController,
  private emailComposer: EmailComposer
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

formatDate(date: string): string {
  return date.split('T')[0]; // "2026-04-30"
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

async prepareTicket(order: any) {

  const productTimes =
    this.racunService.productTimesCache;

  const timeObject = productTimes.find(
    t => t.id == order.starttime
  );

  const vrijeme =
    timeObject?.title || '';

  const data = {

    qrCode: order.code,

    ticketNumber: order.id,

    datum: order.startdate,

    vrijeme: vrijeme,

    odrasli: order.numberadults,

    djeca: order.numberkids,

    bebe: 0,

    ime: order.name || '',

    email: order.mail || '',

    cijena: order.price || 0,

    paymentType:
      order.payment_type || 'rezervacija'
  };

  this.selectedTicket = data;

  this.qrCodeImage =
    await QRCode.toDataURL(data.qrCode);

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
    email: order.mail || '',
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

async generatePdfFile(): Promise<string | null> {

  try {

    const element = this.ticketPdf.nativeElement;

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
      `ticket-${this.selectedTicket.ticketNumber}.pdf`;

    console.log('PDF NAME:', fileName);

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64 as string,
      directory: Directory.Cache
    });

    console.log('PDF SAVED:', savedFile.uri);
    this.cdr.detectChanges();

    return savedFile.uri;

  } catch (err) {

    console.error('PDF ERROR:', err);

    return null;
  }
}


async downloadPdf(order: any) {

  try {

    await this.prepareTicket(order);

    const filePath = await this.generatePdfFile();

    if (!filePath) return;

    await Share.share({
      title: 'Karta',
      text: 'Preuzmi kartu',
      url: filePath,
      dialogTitle: 'Preuzmi PDF'
    });

  } catch (err: any) {

    if (err?.message === 'Share canceled') {
      console.log('User closed share sheet');
      return;
    }

    console.error('Share error:', err);
  }
}

async sendPdfEmail(order: any) {

  await this.prepareTicket(order);

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
