import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-scanner',
  templateUrl: 'scanner.page.html',
  styleUrls: ['scanner.page.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule]
})
export class ScannerPage implements OnInit {
  currentPage: string = 'scanner';
  menuOpen = false;
  isSupported = false;
  barcodes: Barcode[] = [];
  userData: any = null;
  apiUrl = 'https://tickets.semisubmarine-pakostane.com/api/code.php';
  bgColor = 'white';
  textColor = 'white';
  reservedData: any = null;
  scanned = false;
  private isModuleInstalled = false;

  constructor(
    private alertController: AlertController, 
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
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
        await this.validateQRCode(scannedCode);
      }
    } catch (error) {
      console.error('Error scanning barcode', error);
      this.presentAlert('Error scanning barcode.');
    }
  }

  async validateQRCode(qrCode: string) {
  try {
    const rawResponse: any = await firstValueFrom(
      this.http.post(this.apiUrl, { qrCode: qrCode })
    );

    console.log('Raw API response:', rawResponse);

    const response = Array.isArray(rawResponse)
     ? rawResponse[0] 
     : rawResponse;
    
    if (response?.response === 'Success') {
    this.userData = response;
    this.reservedData = null;
    this.scanned = true;
    this.updateBackgroundColor('valid');
  } else {
    this.userData = null;
    this.reservedData = null;
    this.scanned = true;
    this.updateBackgroundColor('sold');
  }
  this.cdr.detectChanges();
  } catch (error) {
    console.error('Error validating QR code', error);
    this.userData = null;
    this.reservedData = null;
    this.scanned = true;
    this.presentAlert('Failed to validate QR code.');
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

  logout() {
    this.authService.logout();
    App.exitApp();
  }

}
