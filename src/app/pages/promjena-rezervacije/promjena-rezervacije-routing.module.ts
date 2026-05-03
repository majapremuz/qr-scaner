import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromjenaRezervacijePage } from './promjena-rezervacije.page';

const routes: Routes = [
  {
    path: '',
    component: PromjenaRezervacijePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromjenaRezervacijePageRoutingModule {}
