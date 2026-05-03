import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromjenaRezervacijePageRoutingModule } from './promjena-rezervacije-routing.module';

import { PromjenaRezervacijePage } from './promjena-rezervacije.page';

@NgModule({
  imports: [
    PromjenaRezervacijePage,
    CommonModule,
    FormsModule,
    IonicModule,
    PromjenaRezervacijePageRoutingModule
  ],
  declarations: []
})
export class PromjenaRezervacijePageModule {}
