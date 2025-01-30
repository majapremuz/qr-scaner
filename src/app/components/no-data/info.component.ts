import { Component, Input, OnInit } from '@angular/core';
import { AlertType } from 'src/app/services/controller.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent  implements OnInit {

  @Input() text: string = '';
  @Input() type: string = '';


  class: string = 'info';
  icon: string = 'information-circle-outline';

  constructor() { }

  ngOnInit() {
    this.getClass();
  }

  getClass(){
    if(this.type == 'success'){
      this.class = 'success';
      this.icon = 'checkmark-circle-outline';
    }
    else if(this.type == 'warning'){
      this.class = 'alert';
      this.icon = 'information-circle-outline';
    }
    else if(this.type == 'danger'){
      this.class = 'danger';
      this.icon = 'alert-circle-outline';
    }
    else{
      this.class = 'success';
      this.icon = 'information-circle-outline';
    }
  }

}
