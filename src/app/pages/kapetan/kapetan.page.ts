import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RačunService } from 'src/app/services/račun.service';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-kapetan',
  templateUrl: './kapetan.page.html',
  styleUrls: ['./kapetan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class KapetanPage implements OnInit {
  currentPage: string = 'kapetan';
  menuOpen = false;
  days: string[] = [];
  times: string[] = [];
  scheduleData: { [key: string]: any[] } = {};
  daySchedules: any[] = [];

  constructor(
    private router: Router,
    public racunService: RačunService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadSchedules();
  }

  loadSchedules() {

    const days = this.generateNextDays();

    forkJoin(
      days.map(day => this.racunService.getSchedule(day))
    ).subscribe(results => {

      const mapped = results.map((res, index) => ({
        day: days[index],
        rows: (res ?? [])
          .slice()
          .sort((a: any, b: any) =>
            a.time.localeCompare(b.time)
          )
      }));

      this.daySchedules = mapped;

      this.cdr.detectChanges();

      console.log('Day schedules:', this.daySchedules);

    });

  }

  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}
  
  generateNextDays(): string[] {
  const today = new Date();

  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);

    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  });
}

openOrders(date: string, time: string) {
  this.router.navigate(['/rezervacije'], {
    queryParams: { date, time }
  });
}

navHome() {
    this.menuOpen = false;
    this.router.navigate(['/home']);
  }

  navInfo() {
    this.menuOpen = false;
    this.router.navigate(['/info']);
  }

  navPotvrda() {
    this.menuOpen = false;
    this.router.navigate(['/potvrda']);
  }

  navList() {
    this.menuOpen = false;
    this.router.navigate(['/kapetan']);
  }

  navChange() {
    this.menuOpen = false;
    this.router.navigate(['/promjena-rezervacije']);
  }

  navScanner() {
    this.menuOpen = false;
    this.router.navigate(['/scanner']);
  }


}
