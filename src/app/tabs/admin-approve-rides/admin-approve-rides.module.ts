import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminApproveRidesPageRoutingModule } from './admin-approve-rides-routing.module';

import { AdminApproveRidesPage } from './admin-approve-rides.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminApproveRidesPageRoutingModule
  ],
  declarations: [AdminApproveRidesPage]
})
export class AdminApproveRidesPageModule {}
