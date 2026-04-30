import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RačunService } from 'src/app/services/račun.service';

@Component({
  selector: 'app-kapetan',
  templateUrl: './kapetan.page.html',
  styleUrls: ['./kapetan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class KapetanPage implements OnInit {
  days: string[] = [];
  times: string[] = [
  '09:00:00',
  '10:00:00',
  '11:00:00',
  '12:00:00',
  '13:00:00',
  '14:00:00',
  '15:00:00',
  '16:00:00',
  '17:00:00',
  '18:00:00',
  '19:00:00',
  '20:00:00',
  '21:00:00',
  '21:40:00',
  '22:25:00'
];


  constructor(
    public racunService: RačunService
  ) { }

  ngOnInit() {
    this.generateNextDays();
  }
  
  generateNextDays() {
  const today = new Date();

  this.days = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
  });
}

}
