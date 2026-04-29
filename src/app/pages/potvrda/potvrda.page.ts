import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-potvrda',
  templateUrl: './potvrda.page.html',
  styleUrls: ['./potvrda.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PotvrdaPage implements OnInit {
  currentPage: string = 'potvrda';
  menuOpen = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

  navHome() {
    this.router.navigate(['/home']);
  }

  navInfo() {
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    this.router.navigate(['/potvrda']);
  }

  navIzdavanje() {
    this.router.navigate(['/izdavanje']);
  }

  navScanner() {
    this.router.navigate(['/scanner']);
  }

}
