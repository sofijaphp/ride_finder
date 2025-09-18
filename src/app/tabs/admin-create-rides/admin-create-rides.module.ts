import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminRidesPageRoutingModule } from './admin-create-rides-routing.module';

import { AdminCreateRidesPage } from './admin-create-rides.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminRidesPageRoutingModule
  ],
  declarations: [AdminCreateRidesPage]
})
export class AdminRidesPageModule {}
