import { NgModule } from "@angular/core";

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { InfoComponent } from "./no-data/info.component";

@NgModule({
    imports: [IonicModule, CommonModule],
    declarations: [InfoComponent],
    exports: [InfoComponent]
})
export class ComponentsModule{}