import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ControllerService } from '../services/controller.service';
import { map, take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReadyPageGuard{

  constructor(
    private controller: ControllerService
  ){
    //
  }
  
  canLoad(): Observable<boolean>{
    return this.controller.readyPage.pipe(
      filter(val => val !== null),
      take(1),
      map (readyPage => {
        if(readyPage){
          return true;
        }
        else{
          return false;
        }
      })
    )
  }
}