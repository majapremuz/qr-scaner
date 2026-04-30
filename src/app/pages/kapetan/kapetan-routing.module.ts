import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KapetanPage } from './kapetan.page';

const routes: Routes = [
  {
    path: '',
    component: KapetanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KapetanPageRoutingModule {}
