import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  userData: any = null;
  apiUrl = 'https://tickets.semisubmarine-pakostane.com/api/code.php';
  bgColor = 'white';
  textColor = 'white';
  private isModuleInstalled = false;

  constructor(private alertController: AlertController, private http: HttpClient) {}

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
  


  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert('Please grant camera permission to use the barcode scanner.');
      return;
    }

    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        const scannedCode = barcodes[0].rawValue; 
        this.validateQRCode(scannedCode);
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

    // If it's an array, use the first element
    const response = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

    if (response && response.response === 'Success') {
      this.updateBackgroundColor('valid');
      this.userData = response;
      console.log('User data:', this.userData);
    } else {
      this.userData = null;
      this.updateBackgroundColor('sold');
    }
  } catch (error) {
    console.error('Error validating QR code', error);
    this.userData = null;
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
}
