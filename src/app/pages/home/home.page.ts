import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  apiUrl = 'https://your-backend.com/api';
  bgColor = 'white';
  private isModuleInstalled = false;

  constructor(private alertController: AlertController, private http: HttpClient) {}

  async ngOnInit() {
    try {
      const result = await BarcodeScanner.isSupported();
      this.isSupported = result.supported;

      // Try installing module once here
      if (!this.isModuleInstalled) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        this.isModuleInstalled = true;
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
      const response: any = await this.http.post(`${this.apiUrl}/validate-qrcode`, { code: qrCode }).toPromise();

      if (response.valid) {
        this.updateBackgroundColor(response.status);
      } else {
        this.presentAlert('Invalid QR code.');
      }
    } catch (error) {
      console.error('Error validating QR code', error);
      this.presentAlert('Failed to validate QR code.');
    }
  }

  updateBackgroundColor(status: string) {
    switch (status) {
      case 'valid':
        this.bgColor = 'green';
        break;
      case 'sold':
        this.bgColor = 'red';
        break;
      case 'reserved':
        this.bgColor = 'yellow';
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
