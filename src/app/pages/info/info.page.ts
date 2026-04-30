import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RačunService } from 'src/app/services/račun.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InfoPage implements OnInit {
  currentPage: string = 'info';
  menuOpen = false;

  vrijeme: string = '';
  ime: string = '';
  prezime: string = '';
  telefon: string = '';
  email: string = '';
  poruka: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private računService: RačunService
  ) { }

  ngOnInit() {
    console.log('PAGE 2 INIT DATA:', this.računService.getData());
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
    const newData = {
    vrijeme: this.vrijeme,
    ime: this.ime,
    prezime: this.prezime,
    telefon: this.telefon,
    email: this.email,
    poruka: this.poruka
  };

  console.log('PAGE 2 SAVING:', newData);

  this.računService.setData(newData);
    this.router.navigate(['/potvrda']);
  }

  navIzdavanje() {
    this.router.navigate(['/kapetan']);
  }

  navScanner() {
    this.router.navigate(['/scanner']);
  }

  navlogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }


}
