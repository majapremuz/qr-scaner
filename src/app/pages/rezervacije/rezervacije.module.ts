import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RezervacijePageRoutingModule } from './rezervacije-routing.module';

import { RezervacijePage } from './rezervacije.page';

@NgModule({
  imports: [
    RezervacijePage,
    CommonModule,
    FormsModule,
    IonicModule,
    RezervacijePageRoutingModule
  ],
  declarations: []
})
export class RezervacijePageModule {}
