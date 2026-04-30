import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import * as QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class PrinterService {

  constructor(private bluetooth: BluetoothSerial) {}

  connect(address: string): Promise<any> {
    return this.bluetooth.connect(address).toPromise();
  }

  print(text: string): Promise<any> {
    return this.bluetooth.write(text);
  }

  async printReceipt(address: string, data: any) {
    const receipt = this.generateReceipt(data);

    await this.bluetooth.connect(address).toPromise();

    return this.bluetooth.write(receipt);
  }

  generateReceipt(data: any): string {
    return `
====================
     RAČUN
====================

From: ${data.polaznaTocka}
Date: ${data.datum}
Time: ${data.vrijeme}

Adults: ${data.odrasli}
Children: ${data.djeca}
Babies: ${data.bebe}

Name: ${data.ime} ${data.prezime}
Phone: ${data.telefon}

QR: ${QRCode.toDataURL(data.qrCode)}

====================
HVALA
====================
`;
  }
}
