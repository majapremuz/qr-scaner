import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { IonToast, ToastController } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

interface ServerResponse {
  response: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, IonToast]
})
export class HomePage implements OnInit {
  
  applyForm= new FormGroup ({
    username: new FormControl(""),
    password: new FormControl("")
  })

  constructor(
    private http: HttpClient,
    private route: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  async ngOnInit() {}

  async login() {
    /*const username = this.applyForm.value?.username || '';
    const password = this.applyForm.value?.password || '';

    const hashedUsername = CryptoJS.SHA1(username).toString();
    const hashedPassword = CryptoJS.SHA1(password).toString();
  
  
    if (this.applyForm.valid && username && password) {
      this.http.post<ServerResponse[]>('https://test.com/api/login.php', {
        username: hashedUsername,
        password: hashedPassword
      }).subscribe({
        next: (response) => {
          const serverResponse = response[0];
          if (serverResponse && serverResponse.response === 'Success') {
            this.authService.login(username, password);
            this.route.navigate(['/one-way-ticket']);
          } else {
            this.toastController.create({
              message: 'Prijava neuspijela. Molim Vas da provrijerite da li su podaci ispravni.',
              duration: 3000,
              color: 'danger'
            }).then(toast => toast.present());  
          }
        },
        error: (error) => {
          this.toastController.create({
            message: 'Greška kod prijave. Molim Vas da pokušate ponovno kasnije.',
            duration: 3000,
            color: 'danger'
          }).then(toast => toast.present());
          console.error('Login failed', error);
        }
      });
    } else {
      this.toastController.create({
        message: 'Molim Vas da ispunite oba polja',
        duration: 3000,
        color: 'danger'
      }).then(toast => toast.present());
    }*/

    this.route.navigate(['/one-way-ticket']);
  }   
    
}
