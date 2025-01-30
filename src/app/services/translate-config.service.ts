import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {

  // za ostatak
 // https://www.djamware.com/post/631719a902bb4f02ac0dab1d/ionic-6-multilanguage-app-using-angular-i18n

  currentLang: string | null;

  //ako je multilanguage onda treba ovaj string ostaviti prazan
  //ovo je forsiranje jednog jezika
  one_language: string = 'hr';

  //TODO ovdje jos treba dodati da slozi popis jezika
  //za koje postoje fajlovi da se moze provjeriti prije nego se fajl popkrene
 
  constructor(
    private translate: TranslateService,
  ) {
    this.currentLang = localStorage.getItem('lang');
  }

  getDefaultLanguage(){ 
    if (this.currentLang) {
      this.translate.setDefaultLang(this.currentLang);
    } else {
      if(this.one_language != ''){
        this.currentLang = this.one_language;
      } 
      else{
        this.currentLang = this.translate.getBrowserLang() || null;
      }

      localStorage.setItem('lang', this.currentLang || '');
      this.translate.setDefaultLang(this.currentLang || '');
    }
    return this.currentLang; 
  }

  setLanguage(setLang: string) {
    this.translate.use(setLang);
    localStorage.setItem('lang', setLang);
  }

  getCurrentLang() {
    return localStorage.getItem('lang');
  }

}
