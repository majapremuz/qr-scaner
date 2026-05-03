import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ReadyPageGuard } from './guards/ready-page.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [ReadyPageGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'scanner',
    loadChildren: () => import('./pages/scanner/scanner.module').then( m => m.ScannerPageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./pages/info/info.module').then( m => m.InfoPageModule)
  },
  {
    path: 'potvrda',
    loadChildren: () => import('./pages/potvrda/potvrda.module').then( m => m.PotvrdaPageModule)
  },
  {
    path: 'kapetan',
    loadChildren: () => import('./pages/kapetan/kapetan.module').then( m => m.KapetanPageModule)
  },
  {
    path: 'promjena-rezervacije',
    loadChildren: () => import('./pages/promjena-rezervacije/promjena-rezervacije.module').then( m => m.PromjenaRezervacijePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
