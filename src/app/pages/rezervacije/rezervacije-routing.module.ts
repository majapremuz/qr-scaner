import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RezervacijePage } from './rezervacije.page';

const routes: Routes = [
  {
    path: '',
    component: RezervacijePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RezervacijePageRoutingModule {}
