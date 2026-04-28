import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ScannerPage } from './scanner.page';

import { ScannerPageRoutingModule } from './scanner-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    ScannerPage,
    CommonModule,
    FormsModule,
    IonicModule,
    ScannerPageRoutingModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: []
})
export class ScannerPageModule {}
