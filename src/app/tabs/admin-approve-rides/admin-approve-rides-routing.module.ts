import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminApproveRidesPage } from './admin-approve-rides.page';

const routes: Routes = [
  {
    path: '',
    component: AdminApproveRidesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminApproveRidesPageRoutingModule {}
