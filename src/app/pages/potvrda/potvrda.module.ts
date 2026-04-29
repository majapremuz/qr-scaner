import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PotvrdaPageRoutingModule } from './potvrda-routing.module';

import { PotvrdaPage } from './potvrda.page';

@NgModule({
  imports: [
    PotvrdaPage,
    CommonModule,
    FormsModule,
    IonicModule,
    PotvrdaPageRoutingModule
  ],
  declarations: []
})
export class PotvrdaPageModule {}
