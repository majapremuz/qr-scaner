import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import CryptoJS from 'crypto-js';

interface ServerResponse {
  response: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

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
    const username = this.applyForm.value?.username || '';
    const password = this.applyForm.value?.password || ''
  
  
    if (this.applyForm.valid && username && password) {
      this.http.post<ServerResponse[]>('https://tickets.semisubmarine-pakostane.com/api/login.php', {
        username: username,
        password: password
      }).subscribe({
        next: (response) => {
          const serverResponse = response[0];
          if (serverResponse && serverResponse.response === 'Success') {
            this.authService.login(username, password);
            this.route.navigate(['/home']);
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
    }
  }   

}
