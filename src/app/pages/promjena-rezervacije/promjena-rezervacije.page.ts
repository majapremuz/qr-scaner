import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-promjena-rezervacije',
  templateUrl: 'promjena-rezervacije.page.html',
  styleUrls: ['promjena-rezervacije.page.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule, FormsModule ]
})
export class PromjenaRezervacijePage implements OnInit {
  currentPage: string = 'scanner';
  menuOpen = false;
  isSupported = false;
  barcodes: Barcode[] = [];
  userData: any = null;
  apiUrl = 'https://tickets.semisubmarine-pakostane.com/api/changereservation.php';
  bgColor = 'white';
  textColor = 'white';
  reservedData: any = null;
  scanned = false;
  private isModuleInstalled = false;
  paymentType: string = 'gotovina';
  status: 'idle' | 'success' | 'error' = 'idle';
  message: string = '';

  constructor(
    private alertController: AlertController, 
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const result = await BarcodeScanner.isSupported();
      this.isSupported = result.supported;
  
      // Try installing the module, but ignore "already installed" errors
      try {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      } catch (error: any) {
        if (error?.message?.includes('already installed')) {
          // Ignore this error
          console.warn('Google Barcode Scanner Module was already installed.');
        } else {
          throw error; // Re-throw if it's another issue
        }
      }
    } catch (error) {
      console.error('Error during initialization', error);
    }
  }
  
toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

async changeReservation(qrCode: string) {
  try {
    const payload = {
      qrCode: qrCode,
      payment_type: this.paymentType
    };

    const rawResponse: any = await firstValueFrom(
      this.http.post(this.apiUrl, payload)
    );

    const response = Array.isArray(rawResponse)
      ? rawResponse[0]
      : rawResponse;

    console.log('Change response:', response);

    this.scanned = true;

    if (response?.response === 'Success') {
      this.status = 'success';
      this.message = 'Rezervacija uspješno promijenjena';
      this.updateBackgroundColor('valid');
    } else {
      this.status = 'error';
      this.message = 'Greška pri promjeni rezervacije';
      this.updateBackgroundColor('sold');
    }
   this.cdr.detectChanges();
  } catch (error) {
    console.error('Change error', error);
    this.presentAlert('Server greška');
  }
}

  async scan(): Promise<void> {
    console.log('Scanning...');
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert('Molim vas da odobrite pristup kameri.');
      return;
    }

    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        const scannedCode = barcodes[0].rawValue; 
        await this.changeReservation(scannedCode);
      }
    } catch (error) {
      console.error('Error scanning barcode', error);
      this.presentAlert('Error scanning barcode.');
    }
  }

  updateBackgroundColor(status: string) {
    switch (status) {
      case 'valid':
        this.bgColor = 'green';
        this.textColor = 'white';
        break;
      case 'sold':
        this.bgColor = 'red';
        this.textColor = 'white';
        break;
      case 'reserved':
        this.bgColor = 'yellow';
        this.textColor = 'white';
        break;
      default:
        this.bgColor = 'white';
        break;
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(message: string, header: string = 'Notice'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
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
