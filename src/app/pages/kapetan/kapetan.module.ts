import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KapetanPageRoutingModule } from './kapetan-routing.module';

import { KapetanPage } from './kapetan.page';

@NgModule({
  imports: [
    KapetanPage,
    CommonModule,
    FormsModule,
    IonicModule,
    KapetanPageRoutingModule
  ],
  declarations: []
})
export class KapetanPageModule {}
