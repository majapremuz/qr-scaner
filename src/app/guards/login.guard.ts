import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ControllerService } from '../services/controller.service';
import { map, take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard{

  constructor(
    private authService: ControllerService,
    private router: Router
  ){
    //
  }
  
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.authenticationState.pipe(
      filter(val => val !== null),
      take(1),
      map (readyPage => {
        if(readyPage){
          return true;
        }else{
          // if(this.authService.user_ver == false){
          //   this.router.navigateByUrl('/verify');
          //   return false;
          // }else{
            const navigation = this.router.getCurrentNavigation();
            let url = '/';
  
            if(navigation){
              url = navigation.extractedUrl.toString();
            }
  
            this.router.navigate(['/login'], { queryParams: { returnto: url}});
            return false;
          // }
        }
      })
    )
  }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  return inject(LoginGuard).canActivate(next, state);
}