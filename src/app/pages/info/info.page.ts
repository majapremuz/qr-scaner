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
  cijena: string = '';
  ime: string = '';
  prezime: string = '';
  telefon: string = '';
  email: string = '';
  poruka: string = '';

  timesWithPrices = [
  { time: '09:00:00', price: 10 },
  { time: '10:00:00', price: 10 },
  { time: '11:00:00', price: 12 },
  { time: '12:00:00', price: 12 },
  { time: '13:00:00', price: 15 },
  { time: '14:00:00', price: 15 },
  { time: '15:00:00', price: 15 },
  { time: '16:00:00', price: 15 },
  { time: '17:00:00', price: 12 },
  { time: '18:00:00', price: 12 },
  { time: '19:00:00', price: 10 },
  { time: '20:00:00', price: 10 },
  { time: '21:00:00', price: 10 },
  { time: '21:40:00', price: 10 },
  { time: '22:25:00', price: 10 }
];

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

get selectedPrice(): number {
  const selected = this.timesWithPrices.find(t => t.time === this.vrijeme);
  return selected ? selected.price : 0;
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
    cijena: this.selectedPrice,
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
